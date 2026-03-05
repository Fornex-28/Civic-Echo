"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { CivicReport, ReportCategory } from "@/lib/types";
import { useZkWhisper } from "@/hooks/useZkWhisper";
import ReportDrawer from "@/components/ReportDrawer";
import NewReportForm from "@/components/NewReportForm";
import { useToast } from "@/components/ToastProvider";

// Dynamic import to avoid SSR issues with mapbox-gl
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function MapPage() {
    const { connected } = useWallet();
    const { toast } = useToast();
    const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
    const [newReportCoords, setNewReportCoords] = useState<{ lat: number; lng: number } | null>(null);

    const {
        reports,
        isOnChain,
        loading,
        createReport,
        echoReport,
    } = useZkWhisper();

    const handleMapClick = useCallback(
        (lat: number, lng: number) => {
            if (!connected) {
                toast("info", "Connect your wallet to submit a report");
                return;
            }
            setSelectedReport(null);
            setNewReportCoords({ lat, lng });
        },
        [connected, toast]
    );

    const handleMarkerClick = useCallback((report: CivicReport) => {
        setNewReportCoords(null);
        setSelectedReport(report);
    }, []);

    const handleEcho = useCallback(
        async (reportId: string) => {
            if (!connected) {
                toast("info", "Connect your wallet to echo a report");
                return;
            }
            const success = await echoReport(reportId);
            if (success) {
                setSelectedReport((prev) => {
                    if (!prev || prev.id !== reportId) return prev;
                    const newUpvotes = prev.upvotes + 1;
                    return { ...prev, upvotes: newUpvotes, isPetition: newUpvotes >= 100 };
                });
            }
        },
        [echoReport, connected, toast]
    );

    const handleNewReport = useCallback(
        async (data: {
            district: string;
            wardNumber: number;
            description: string;
            title: string;
            category: ReportCategory;
            imageUrl: string;
        }) => {
            if (!newReportCoords) return;

            await createReport({
                lat: newReportCoords.lat,
                lng: newReportCoords.lng,
                district: data.district,
                wardNumber: data.wardNumber,
                description: data.description,
                title: data.title,
                category: data.category,
                imageUrl: data.imageUrl,
            });

            setNewReportCoords(null);
        },
        [newReportCoords, createReport]
    );

    return (
        <main className="map-page relative w-screen overflow-hidden">
            <MapView
                reports={reports}
                onMapClick={handleMapClick}
                onMarkerClick={handleMarkerClick}
            />

            {/* Top header bar */}
            <motion.header
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 20 }}
                className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
                style={{
                    background: "linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0) 100%)",
                }}
            >
                <div className="flex items-center gap-3">
                    <a href="/" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
                        <img src="/logo.png" alt="Civic Echo" className="w-9 h-9 rounded-lg" />
                        <div>
                            <h1 className="text-sm font-bold tracking-wide" style={{ color: "var(--text-1)" }}>
                                Civic Echo
                            </h1>
                            <p className="text-[10px]" style={{ color: "var(--text-3)" }}>
                                Anonymous Civic Reporting • Nepal
                            </p>
                        </div>
                    </a>
                </div>

                <div className="flex items-center gap-3">
                    {isOnChain && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono"
                            style={{
                                background: "rgba(0, 212, 255, 0.1)",
                                color: "var(--cyan)",
                                border: "1px solid rgba(0, 212, 255, 0.3)",
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--cyan)" }} />
                            on-chain
                        </motion.div>
                    )}

                    <div
                        className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full text-xs"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                        <span style={{ color: "var(--danger)" }}>
                            🔴 {reports.filter((r) => !r.isPetition).length} reports
                        </span>
                        <span style={{ color: "var(--accent)" }}>
                            🟢 {reports.filter((r) => r.isPetition).length} petitions
                        </span>
                    </div>

                    <WalletMultiButton />
                </div>
            </motion.header>

            {/* Bottom hint */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full text-xs font-medium"
                style={{
                    background: "rgba(10,10,15,0.85)",
                    color: "var(--text-2)",
                    border: "1px solid var(--line)",
                    backdropFilter: "blur(8px)",
                }}
            >
                {connected
                    ? isOnChain
                        ? "Click anywhere on the map to submit a report on-chain 📍"
                        : "Click anywhere on the map to drop a report 📍"
                    : "Connect your wallet to submit reports • Hover markers to preview 📍"}
            </motion.div>

            {loading && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full text-xs font-mono"
                    style={{
                        background: "rgba(10,10,15,0.9)",
                        color: "var(--cyan)",
                        border: "1px solid rgba(0, 212, 255, 0.2)",
                    }}
                >
                    Fetching on-chain reports...
                </div>
            )}

            <ReportDrawer
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onEcho={handleEcho}
                isVerified={connected}
            />

            {newReportCoords && (
                <NewReportForm
                    lat={newReportCoords.lat}
                    lng={newReportCoords.lng}
                    onSubmit={handleNewReport}
                    onCancel={() => setNewReportCoords(null)}
                />
            )}
        </main>
    );
}
