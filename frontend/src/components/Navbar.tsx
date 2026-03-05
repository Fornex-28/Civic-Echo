"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import NavSearch from "@/components/NavSearch";

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "";

interface NavbarProps {
    /** "fixed" positions the nav fixed (homepage), "sticky" makes it sticky (default) */
    position?: "fixed" | "sticky";
    /** Extra inline styles for the outer nav element */
    style?: React.CSSProperties;
}

const NAV_LINKS = [
    { href: "/map", label: "Map" },
    { href: "/reports", label: "Reports" },
    { href: "/create", label: "+ Create", accent: true },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar({ position = "sticky", style }: NavbarProps) {
    const pathname = usePathname();
    const wallet = useWallet();
    const isAdmin = wallet.publicKey?.toBase58() === ADMIN_WALLET;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const links = [
        ...NAV_LINKS,
        ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <>
            <nav
                style={{
                    position,
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    backdropFilter: "blur(16px) saturate(1.2)",
                    WebkitBackdropFilter: "blur(16px) saturate(1.2)",
                    background: "rgba(7,7,13,0.78)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    ...style,
                }}
            >
                <div
                    style={{
                        maxWidth: 1400,
                        margin: "0 auto",
                        padding: "0 20px",
                        height: 56,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    {/* Logo */}
                    <Link
                        href="/"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            textDecoration: "none",
                        }}
                    >
                        <img
                            src="/logo.png"
                            alt="Civic Echo"
                            style={{ width: 32, height: 32, borderRadius: 8 }}
                        />
                        <span
                            style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: "#fff",
                                letterSpacing: "-0.01em",
                            }}
                        >
                            Civic Echo
                        </span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="navbar-desktop-links">
                        {links.map((link) => {
                            const active = isActive(link.href);
                            const accent = (link as any).accent && !active;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    style={{
                                        padding: accent
                                            ? "6px 16px"
                                            : "8px 16px",
                                        fontSize: 13,
                                        fontWeight: active || accent ? 700 : 500,
                                        color: accent
                                            ? "#07070d"
                                            : active
                                                ? "var(--accent)"
                                                : "rgba(255,255,255,0.6)",
                                        background: accent
                                            ? "var(--accent)"
                                            : "transparent",
                                        textDecoration: "none",
                                        borderRadius: accent ? 20 : 8,
                                        transition: "all 0.2s",
                                        boxShadow: accent
                                            ? "0 2px 12px var(--accent-glow)"
                                            : "none",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!accent && !active) {
                                            e.currentTarget.style.color =
                                                "#fff";
                                            e.currentTarget.style.background =
                                                "rgba(255,255,255,0.06)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!accent && !active) {
                                            e.currentTarget.style.color =
                                                "rgba(255,255,255,0.6)";
                                            e.currentTarget.style.background =
                                                "transparent";
                                        }
                                    }}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <NavSearch />

                        <Link
                            href="/map"
                            className="navbar-desktop-links"
                            style={{
                                padding: "8px 20px",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#07070d",
                                background: "var(--accent)",
                                borderRadius: 10,
                                textDecoration: "none",
                                boxShadow: "0 2px 12px rgba(0,232,123,0.2)",
                                transition: "all 0.2s",
                            }}
                        >
                            Open Map →
                        </Link>

                        {mounted && <WalletMultiButton />}

                        {/* Mobile hamburger button */}
                        <button
                            className="navbar-mobile-hamburger"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Open menu"
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: 6,
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                            }}
                        >
                            <span
                                style={{
                                    display: "block",
                                    width: 20,
                                    height: 2,
                                    background: "#fff",
                                    borderRadius: 2,
                                }}
                            />
                            <span
                                style={{
                                    display: "block",
                                    width: 20,
                                    height: 2,
                                    background: "#fff",
                                    borderRadius: 2,
                                }}
                            />
                            <span
                                style={{
                                    display: "block",
                                    width: 14,
                                    height: 2,
                                    background: "rgba(255,255,255,0.5)",
                                    borderRadius: 2,
                                }}
                            />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setMobileOpen(false)}
                            style={{
                                position: "fixed",
                                inset: 0,
                                zIndex: 999,
                                background: "rgba(0,0,0,0.6)",
                                backdropFilter: "blur(4px)",
                            }}
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{
                                type: "spring",
                                damping: 26,
                                stiffness: 300,
                            }}
                            style={{
                                position: "fixed",
                                top: 0,
                                right: 0,
                                bottom: 0,
                                width: 280,
                                zIndex: 1000,
                                background: "rgba(14,14,26,0.97)",
                                borderLeft:
                                    "1px solid rgba(255,255,255,0.08)",
                                backdropFilter: "blur(24px)",
                                padding: "24px 20px",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setMobileOpen(false)}
                                style={{
                                    alignSelf: "flex-end",
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: 8,
                                    width: 36,
                                    height: 36,
                                    display: "grid",
                                    placeItems: "center",
                                    cursor: "pointer",
                                    color: "#fff",
                                    fontSize: 16,
                                    marginBottom: 24,
                                }}
                            >
                                ✕
                            </button>

                            {/* Nav links */}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                }}
                            >
                                {links.map((link, i) => {
                                    const active = isActive(link.href);
                                    return (
                                        <motion.div
                                            key={link.href}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: i * 0.05,
                                            }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    padding: "14px 16px",
                                                    borderRadius: 10,
                                                    fontSize: 15,
                                                    fontWeight: active
                                                        ? 700
                                                        : 500,
                                                    color: active
                                                        ? "var(--accent)"
                                                        : "rgba(255,255,255,0.7)",
                                                    background: active
                                                        ? "rgba(0,232,123,0.08)"
                                                        : "transparent",
                                                    textDecoration: "none",
                                                    transition: "all 0.15s",
                                                }}
                                            >
                                                {link.label}
                                                {active && (
                                                    <span
                                                        style={{
                                                            marginLeft:
                                                                "auto",
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius:
                                                                "50%",
                                                            background:
                                                                "var(--accent)",
                                                        }}
                                                    />
                                                )}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Spacer */}
                            <div style={{ flex: 1 }} />

                            {/* Bottom CTA */}
                            <Link
                                href="/map"
                                onClick={() => setMobileOpen(false)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    padding: "14px 16px",
                                    borderRadius: 12,
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: "#07070d",
                                    background: "var(--accent)",
                                    textDecoration: "none",
                                    boxShadow:
                                        "0 4px 20px rgba(0,232,123,0.3)",
                                    marginBottom: 12,
                                }}
                            >
                                🗺️ Open Map
                            </Link>

                            <div
                                style={{
                                    fontSize: 11,
                                    color: "rgba(255,255,255,0.3)",
                                    textAlign: "center",
                                }}
                            >
                                Civic Echo · Solana Devnet
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
