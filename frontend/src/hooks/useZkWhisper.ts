"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
    PublicKey,
    SystemProgram,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN, setProvider } from "@coral-xyz/anchor";
import idl from "@/lib/idl/zk_whisper.json";
import { CivicReport } from "@/lib/types";
import { DUMMY_REPORTS } from "@/lib/dummy-data";
import { useToast } from "@/components/ToastProvider";
import { supabase } from "@/lib/supabase";

// The program ID — reads from env or falls back to placeholder.
const PROGRAM_ID = new PublicKey(
    process.env.NEXT_PUBLIC_PROGRAM_ID || "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
);

/**
 * Derive the CivicReport PDA address.
 */
function findReportPda(reporter: PublicKey, reportId: number): [PublicKey, number] {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(BigInt(reportId));
    return PublicKey.findProgramAddressSync(
        [Buffer.from("report"), reporter.toBuffer(), buf],
        PROGRAM_ID
    );
}

/**
 * Derive the EchoReceipt PDA address.
 */
function findEchoPda(report: PublicKey, voter: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
        [Buffer.from("echo"), report.toBuffer(), voter.toBuffer()],
        PROGRAM_ID
    );
}

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------

/** Convert a Supabase row (snake_case) into the frontend CivicReport type */
function rowToReport(row: any): CivicReport {
    return {
        id: row.id,
        locationLat: row.location_lat,
        locationLng: row.location_lng,
        district: row.district,
        wardNumber: row.ward_number,
        ipfsCid: row.ipfs_cid,
        upvotes: row.upvotes,
        isPetition: row.is_petition,
        reporter: row.reporter,
        category: row.category || "other",
        createdAt: new Date(row.created_at).getTime(),
        title: row.title,
        description: row.description || "",
        imageUrl: row.image_url || "",
        status: row.status || "active",
    };
}

// ---------------------------------------------------------------------------
// Echo dedup helpers (localStorage)
// ---------------------------------------------------------------------------

function getEchoKey(wallet: string): string {
    return `civic-echo-echoes:${wallet}`;
}

function getEchoedSet(wallet: string): Set<string> {
    try {
        const raw = localStorage.getItem(getEchoKey(wallet));
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

function markEchoed(wallet: string, reportId: string): void {
    const set = getEchoedSet(wallet);
    set.add(reportId);
    try {
        localStorage.setItem(getEchoKey(wallet), JSON.stringify([...set]));
    } catch { /* quota exceeded — ignore */ }
}

function hasEchoed(wallet: string, reportId: string): boolean {
    return getEchoedSet(wallet).has(reportId);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseZkWhisperReturn {
    reports: CivicReport[];
    isOnChain: boolean;
    loading: boolean;
    createReport: (params: {
        lat: number;
        lng: number;
        district: string;
        wardNumber: number;
        description: string;
        title?: string;
        category?: string;
        imageUrl?: string;
    }) => Promise<string | null>;
    echoReport: (reportId: string) => Promise<boolean>;
    closeReport: (reportId: string) => Promise<boolean>;
    settleReport: (reportId: string) => Promise<boolean>;
    deleteReport: (reportId: string) => Promise<boolean>;
    updateReport: (reportId: string, fields: Partial<{ title: string; description: string; category: string; status: string }>) => Promise<boolean>;
    refreshReports: () => Promise<void>;
}

export function useZkWhisper(): UseZkWhisperReturn {
    const { connection } = useConnection();
    const wallet = useWallet();
    const { toast, dismiss } = useToast();
    const [reports, setReports] = useState<CivicReport[]>([]);
    const [isOnChain, setIsOnChain] = useState(false);
    const [loading, setLoading] = useState(true);
    const [program, setProgram] = useState<Program | null>(null);

    // ---------- Supabase Realtime subscription ----------
    useEffect(() => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL" || !supabaseUrl.startsWith("http")) {
            return; // No realtime if Supabase isn't configured
        }

        const channel = supabase
            .channel("reports-realtime")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "reports" },
                (payload) => {
                    const newReport = rowToReport(payload.new);
                    setReports((prev) => {
                        // Avoid duplicate — might already exist from optimistic add
                        if (prev.some((r) => r.id === newReport.id)) return prev;
                        return [newReport, ...prev];
                    });
                }
            )
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "reports" },
                (payload) => {
                    const updated = rowToReport(payload.new);
                    setReports((prev) =>
                        prev.map((r) => (r.id === updated.id ? updated : r))
                    );
                }
            )
            .on(
                "postgres_changes",
                { event: "DELETE", schema: "public", table: "reports" },
                (payload) => {
                    const deletedId = (payload.old as any)?.id;
                    if (deletedId) {
                        setReports((prev) => prev.filter((r) => r.id !== deletedId));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // ---------- Initialise the Anchor Program when wallet connects ----------
    useEffect(() => {
        if (!wallet.publicKey || !wallet.signTransaction) {
            setProgram(null);
            setIsOnChain(false);
            return;
        }

        try {
            const provider = new AnchorProvider(
                connection,
                wallet as any,
                AnchorProvider.defaultOptions()
            );
            setProvider(provider);

            const pg = new Program(idl as any, provider);
            setProgram(pg);
            setIsOnChain(true);
            toast("success", "Wallet connected — on-chain mode active");
        } catch (err) {
            console.warn("Could not initialise Anchor program:", err);
            setProgram(null);
            setIsOnChain(false);
        }
    }, [wallet, connection]);

    // ---------- Fetch all reports from Supabase ----------
    const refreshReports = useCallback(async () => {
        setLoading(true);

        try {
            // If Supabase is not configured at all, use dummy data for local dev
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "YOUR_SUPABASE_URL") {
                setReports(DUMMY_REPORTS);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("reports")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Always use Supabase data — don't mix with dummy data
            setReports((data || []).map(rowToReport));
        } catch (err) {
            console.warn("Failed to fetch reports from Supabase:", err);
            // Only use dummy as last resort if fetch completely fails
            setReports((prev) => prev.length > 0 ? prev : DUMMY_REPORTS);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load reports on mount
    useEffect(() => {
        refreshReports();
    }, [refreshReports]);

    // ---------- Create a new report ----------
    const createReport = useCallback(
        async (params: {
            lat: number;
            lng: number;
            district: string;
            wardNumber: number;
            description: string;
            title?: string;
            category?: string;
            imageUrl?: string;
        }): Promise<string | null> => {
            const loadingId = toast("loading", "Saving report...");

            // --- Optimistic: add to local state immediately ---
            const tempId = `temp-${Date.now()}`;
            const optimisticReport: CivicReport = {
                id: tempId,
                locationLat: params.lat,
                locationLng: params.lng,
                district: params.district,
                wardNumber: params.wardNumber,
                ipfsCid: "",
                upvotes: 0,
                isPetition: false,
                reporter: wallet.publicKey?.toBase58() || "anonymous",
                category: (params.category as any) || "other",
                createdAt: Date.now(),
                title: params.title || params.description.slice(0, 80),
                description: params.description,
                imageUrl: params.imageUrl || "",
                status: "active",
            };
            setReports((prev) => [optimisticReport, ...prev]);

            try {
                // 1. Always insert into Supabase first
                const { data: inserted, error: insertError } = await supabase
                    .from("reports")
                    .insert({
                        location_lat: params.lat,
                        location_lng: params.lng,
                        district: params.district,
                        ward_number: params.wardNumber,
                        description: params.description,
                        title: params.title || params.description.slice(0, 80),
                        category: params.category || "other",
                        image_url: params.imageUrl || "",
                        ipfs_cid: `QmMock_${Date.now().toString(36)}`,
                        reporter: wallet.publicKey?.toBase58() || "anonymous",
                        status: "active",
                    })
                    .select()
                    .single();

                if (insertError) throw insertError;

                // Replace temp report with real one
                const realReport = rowToReport(inserted);
                setReports((prev) =>
                    prev.map((r) => (r.id === tempId ? realReport : r))
                );

                // 2. Optionally submit on-chain if wallet is connected
                let txHash: string | undefined;
                if (program && wallet.publicKey) {
                    try {
                        const reportId = Date.now();
                        const [reportPda] = findReportPda(wallet.publicKey, reportId);

                        txHash = await program.methods
                            .initializeReport(
                                new BN(reportId),
                                params.lat,
                                params.lng,
                                params.district,
                                params.wardNumber,
                                inserted.ipfs_cid,
                                params.category || "other"
                            )
                            .accounts({
                                civicReport: reportPda,
                                reporter: wallet.publicKey,
                                systemProgram: SystemProgram.programId,
                            })
                            .rpc();

                        // Update Supabase row with tx hash
                        await supabase
                            .from("reports")
                            .update({ tx_hash: txHash })
                            .eq("id", inserted.id);
                    } catch (chainErr) {
                        console.warn("On-chain submit failed (saved to Supabase):", chainErr);
                    }
                }

                dismiss(loadingId);
                toast("success", `Report saved in ${params.district}`, txHash ? { txHash } : undefined);
                return inserted.id;
            } catch (err: any) {
                // --- Rollback optimistic insert ---
                setReports((prev) => prev.filter((r) => r.id !== tempId));
                dismiss(loadingId);
                console.error("Failed to create report:", err);
                toast("error", err?.message?.slice(0, 120) || "Failed to save report");
                return null;
            }
        },
        [program, wallet.publicKey, toast, dismiss]
    );

    // ---------- Echo (upvote) a report ----------
    const echoReport = useCallback(
        async (reportId: string): Promise<boolean> => {
            const walletAddr = wallet.publicKey?.toBase58() || "anonymous";

            // --- Duplicate echo prevention ---
            if (hasEchoed(walletAddr, reportId)) {
                toast("info", "You have already echoed this report");
                return false;
            }

            // --- Optimistic update: immediately increment in UI ---
            setReports((prev) =>
                prev.map((r) => {
                    if (r.id !== reportId) return r;
                    const newUpvotes = r.upvotes + 1;
                    return {
                        ...r,
                        upvotes: newUpvotes,
                        isPetition: newUpvotes >= 100 ? true : r.isPetition,
                    };
                })
            );

            const loadingId = toast("loading", "Sending echo...");

            try {
                // 1. Try to get current report from Supabase
                const { data: current, error: fetchErr } = await supabase
                    .from("reports")
                    .select("upvotes")
                    .eq("id", reportId)
                    .single();

                if (fetchErr || !current) {
                    // Report not in Supabase (likely dummy data) — local-only echo
                    markEchoed(walletAddr, reportId);
                    dismiss(loadingId);
                    toast("success", "Echo registered");
                    return true;
                }

                const newUpvotes = (current.upvotes || 0) + 1;
                const isPetition = newUpvotes >= 100;

                // 2. Update in Supabase
                const updatePayload: Record<string, any> = { upvotes: newUpvotes };
                if (isPetition) {
                    updatePayload.is_petition = true;
                    updatePayload.status = "petition";
                }

                const { error: updateErr } = await supabase
                    .from("reports")
                    .update(updatePayload)
                    .eq("id", reportId);

                if (updateErr) throw updateErr;

                // Mark as echoed in localStorage
                markEchoed(walletAddr, reportId);

                // 3. Optionally echo on-chain
                if (program && wallet.publicKey) {
                    try {
                        const isValidPubkey = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(reportId);
                        if (isValidPubkey) {
                            const reportPubkey = new PublicKey(reportId);
                            const [echoPda] = findEchoPda(reportPubkey, wallet.publicKey);

                            const txHash = await program.methods
                                .echoReport()
                                .accounts({
                                    civicReport: reportPubkey,
                                    echoReceipt: echoPda,
                                    voter: wallet.publicKey,
                                    systemProgram: SystemProgram.programId,
                                })
                                .rpc();

                            dismiss(loadingId);
                            toast("success", "Echo submitted on-chain", { txHash });
                        } else {
                            dismiss(loadingId);
                            toast("success", "Echo registered");
                        }
                    } catch (chainErr: any) {
                        dismiss(loadingId);
                        if (chainErr?.message?.includes("already in use")) {
                            toast("info", "You have already echoed this report");
                        } else {
                            toast("success", "Echo saved to database");
                        }
                    }
                } else {
                    dismiss(loadingId);
                    toast("success", "Echo registered");
                }

                return true;
            } catch (err: any) {
                // --- Rollback optimistic update on error ---
                setReports((prev) =>
                    prev.map((r) => {
                        if (r.id !== reportId) return r;
                        return { ...r, upvotes: r.upvotes - 1 };
                    })
                );
                dismiss(loadingId);
                console.error("Failed to echo report:", err);
                toast("error", "Echo failed");
                return false;
            }
        },
        [program, wallet.publicKey, toast, dismiss]
    );

    // ---------- Close a report ----------
    const closeReport = useCallback(
        async (reportId: string): Promise<boolean> => {
            if (!wallet.publicKey) {
                toast("error", "Connect wallet to close reports");
                return false;
            }

            const loadingId = toast("loading", "Closing report...");

            try {
                // 1. Update status in Supabase
                const { error: updateErr } = await supabase
                    .from("reports")
                    .update({ status: "closed" })
                    .eq("id", reportId);

                if (updateErr) throw updateErr;

                // 2. Optionally close on-chain
                if (program) {
                    try {
                        const reportPubkey = new PublicKey(reportId);

                        const txHash = await program.methods
                            .closeReport()
                            .accounts({
                                civicReport: reportPubkey,
                                reporter: wallet.publicKey,
                            })
                            .rpc();

                        dismiss(loadingId);
                        toast("success", "Report closed on-chain", { txHash });
                    } catch (chainErr) {
                        dismiss(loadingId);
                        toast("success", "Report closed in database");
                    }
                } else {
                    dismiss(loadingId);
                    toast("success", "Report closed");
                }

                await refreshReports();
                return true;
            } catch (err: any) {
                dismiss(loadingId);
                console.error("Failed to close report:", err);
                toast("error", err?.message?.slice(0, 120) || "Failed to close report");
                return false;
            }
        },
        [program, wallet.publicKey, refreshReports, toast, dismiss]
    );

    // ---------- Admin: Settle a report ----------
    const settleReport = useCallback(
        async (reportId: string): Promise<boolean> => {
            const loadingId = toast("loading", "Settling report...");
            try {
                const { error } = await supabase
                    .from("reports")
                    .update({ status: "settled" })
                    .eq("id", reportId);
                if (error) throw error;

                dismiss(loadingId);
                toast("success", "Report marked as settled");
                await refreshReports();
                return true;
            } catch (err: any) {
                dismiss(loadingId);
                console.error("Failed to settle report:", err);
                toast("error", err?.message?.slice(0, 120) || "Failed to settle report");
                return false;
            }
        },
        [refreshReports, toast, dismiss]
    );

    // ---------- Admin: Delete a report ----------
    const deleteReport = useCallback(
        async (reportId: string): Promise<boolean> => {
            const loadingId = toast("loading", "Deleting report...");
            try {
                const { error } = await supabase
                    .from("reports")
                    .delete()
                    .eq("id", reportId);
                if (error) throw error;

                dismiss(loadingId);
                toast("success", "Report deleted");
                await refreshReports();
                return true;
            } catch (err: any) {
                dismiss(loadingId);
                console.error("Failed to delete report:", err);
                toast("error", err?.message?.slice(0, 120) || "Failed to delete report");
                return false;
            }
        },
        [refreshReports, toast, dismiss]
    );

    // ---------- Admin: Update a report ----------
    const updateReport = useCallback(
        async (reportId: string, fields: Partial<{ title: string; description: string; category: string; status: string }>): Promise<boolean> => {
            const loadingId = toast("loading", "Updating report...");
            try {
                const { error } = await supabase
                    .from("reports")
                    .update(fields)
                    .eq("id", reportId);
                if (error) throw error;

                dismiss(loadingId);
                toast("success", "Report updated");
                await refreshReports();
                return true;
            } catch (err: any) {
                dismiss(loadingId);
                console.error("Failed to update report:", err);
                toast("error", err?.message?.slice(0, 120) || "Failed to update report");
                return false;
            }
        },
        [refreshReports, toast, dismiss]
    );

    return {
        reports,
        isOnChain,
        loading,
        createReport,
        echoReport,
        closeReport,
        settleReport,
        deleteReport,
        updateReport,
        refreshReports,
    };
}
