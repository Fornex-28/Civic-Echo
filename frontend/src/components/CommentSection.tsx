"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";

interface Comment {
    id: string;
    report_id: string;
    author: string;
    content: string;
    created_at: string;
}

interface CommentSectionProps {
    reportId: string;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function shortenAddress(addr: string): string {
    if (addr.length <= 12 || addr === "anonymous") return addr;
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export default function CommentSection({ reportId }: CommentSectionProps) {
    const wallet = useWallet();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchComments = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("comments")
                .select("*")
                .eq("report_id", reportId)
                .order("created_at", { ascending: true });

            if (error) throw error;
            setComments(data || []);
        } catch (err) {
            console.warn("Failed to fetch comments:", err);
            // Silently fail — table might not exist yet
        } finally {
            setLoading(false);
        }
    }, [reportId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || submitting) return;

        setSubmitting(true);
        try {
            const author = wallet.publicKey?.toBase58() || "anonymous";
            const { error } = await supabase
                .from("comments")
                .insert({
                    report_id: reportId,
                    author,
                    content: newComment.trim(),
                });

            if (error) throw error;
            setNewComment("");
            await fetchComments();
        } catch (err) {
            console.error("Failed to post comment:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            style={{
                background: "var(--bg-elevated, #141422)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: 24,
                marginTop: 28,
            }}
        >
            <h3
                style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-1)",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                💬 Comments
                {comments.length > 0 && (
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            background: "var(--accent-dim)",
                            color: "var(--accent)",
                            padding: "2px 8px",
                            borderRadius: 999,
                        }}
                    >
                        {comments.length}
                    </span>
                )}
            </h3>

            {/* Comment list */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-3)", fontSize: 13 }}>
                    Loading comments...
                </div>
            ) : comments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text-3)", fontSize: 13 }}>
                    No comments yet. Be the first to comment!
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                    <AnimatePresence>
                        {comments.map((c) => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    background: "rgba(255,255,255,0.02)",
                                    border: "1px solid var(--line)",
                                    borderRadius: 10,
                                    padding: "12px 16px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 6,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: "var(--accent)",
                                            fontFamily: "var(--font-mono)",
                                        }}
                                    >
                                        {shortenAddress(c.author)}
                                    </span>
                                    <span style={{ fontSize: 10, color: "var(--text-3)" }}>
                                        {timeAgo(c.created_at)}
                                    </span>
                                </div>
                                <p style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.5, margin: 0 }}>
                                    {c.content}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add comment form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={2}
                    style={{
                        flex: 1,
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid var(--line)",
                        background: "var(--bg-secondary)",
                        color: "var(--text-1)",
                        fontSize: 13,
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                        transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line)"; }}
                />
                <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    style={{
                        padding: "10px 20px",
                        borderRadius: 10,
                        border: "none",
                        background: submitting || !newComment.trim() ? "rgba(0,232,123,0.15)" : "var(--accent)",
                        color: submitting || !newComment.trim() ? "rgba(0,232,123,0.5)" : "#07070d",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: submitting || !newComment.trim() ? "not-allowed" : "pointer",
                        transition: "all 0.2s",
                        whiteSpace: "nowrap",
                    }}
                >
                    {submitting ? "Posting..." : "Post"}
                </button>
            </form>
        </div>
    );
}
