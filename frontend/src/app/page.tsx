"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useZkWhisper } from "@/hooks/useZkWhisper";
import { CATEGORY_META } from "@/lib/types";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

const GlobeView = dynamic(() => import("@/components/GlobeView"), { ssr: false });

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { reports } = useZkWhisper();

  const totalReports = reports.length;
  const totalPetitions = reports.filter((r) => r.isPetition).length;
  const totalEchoes = reports.reduce((s, r) => s + r.upvotes, 0);

  /* Scroll progress tracking */
  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * 1.5; // Page is ~250vh, zoom completes at ~150vh
      const progress = Math.min(1, scrollY / maxScroll);
      setScrollProgress(progress);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const overlayOpacity = Math.max(0, 1 - scrollProgress * 3); // Fades out as you scroll
  const zoomedIn = scrollProgress > 0.8;

  return (
    <div
      ref={containerRef}
      style={{
        background: "rgb(8, 8, 18)",
        minHeight: "250vh",
        position: "relative",
      }}
    >
      {/* Globe — fixed on the right */}
      <GlobeView reports={reports} scrollProgress={scrollProgress} />



      {/* ═══ Floating navbar ═══ */}
      <Navbar position="fixed" />

      {/* ═══ Hero overlay — fades out on scroll ═══ */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          pointerEvents: overlayOpacity < 0.1 ? "none" : "auto",
          display: "flex",
          alignItems: "center",
        }}
        animate={{ opacity: overlayOpacity }}
        transition={{ duration: 0 }} // Instant — driven by scroll
      >
        <div
          style={{
            maxWidth: 520,
            padding: "0 40px",
            marginTop: -40,
          }}
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                borderRadius: 999,
                border: "1px solid rgba(0,232,123,0.2)",
                background: "rgba(0,232,123,0.06)",
                fontSize: 12,
                fontWeight: 500,
                color: "#00e87b",
                marginBottom: 28,
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#00e87b",
                  animation: "liveBlink 2s ease-in-out infinite",
                }}
              />
              Live on Solana Devnet
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: "clamp(38px, 5vw, 60px)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#fff",
              marginBottom: 20,
            }}
          >
            Report what
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #00e87b 30%, #00d4ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              you see.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.55)",
              maxWidth: 440,
              marginBottom: 36,
            }}
          >
            Nepal&apos;s first decentralized whistleblowing platform. Expose
            corruption, flag infrastructure failures — completely anonymously,
            on Solana.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}
          >
            <Link
              href="/map"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 28px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                background: "#00e87b",
                color: "#07070d",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(0,232,123,0.3)",
                transition: "all 0.2s",
              }}
            >
              🗺️ Explore Map
            </Link>
            <Link
              href="/reports"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 28px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 500,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                textDecoration: "none",
                backdropFilter: "blur(8px)",
                transition: "all 0.2s",
              }}
            >
              View Reports
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              display: "flex",
              gap: 36,
              padding: "20px 24px",
              borderRadius: 14,
              background: "rgba(10,10,20,0.5)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
            }}
          >
            {[
              { n: totalReports, l: "Total Reports", c: "#00d4ff" },
              { n: totalPetitions, l: "Petitions", c: "#00e87b" },
              { n: totalEchoes, l: "Echoes", c: "#a855f7" },
            ].map((s) => (
              <div key={s.l}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: s.c,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.n.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                  {s.l}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ═══ Scroll indicator ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: overlayOpacity > 0.7 ? 1 : 0 }}
        style={{
          position: "fixed",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
          SCROLL TO EXPLORE
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 20,
            height: 32,
            borderRadius: 10,
            border: "1.5px solid rgba(255,255,255,0.2)",
            display: "flex",
            justifyContent: "center",
            paddingTop: 6,
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1], y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 3,
              height: 8,
              borderRadius: 2,
              background: "rgba(255,255,255,0.4)",
            }}
          />
        </motion.div>
      </motion.div>

      {/* ═══ Bottom CTA — appears after scroll, grows as you scroll ═══ */}
      {(() => {
        // Button appears at 20% scroll, fully grown at 100%
        const btnProgress = Math.max(0, (scrollProgress - 0.2) / 0.8);
        const btnOpacity = Math.min(1, btnProgress * 2); // Fades in quickly
        const btnScale = 0.7 + btnProgress * 0.5; // 0.7 → 1.2
        const btnPadV = 12 + btnProgress * 12; // 12px → 24px
        const btnPadH = 24 + btnProgress * 28; // 24px → 52px
        const btnFontSize = 13 + btnProgress * 7; // 13px → 20px
        const btnRadius = 12 + btnProgress * 8; // 12 → 20
        const btnGlow = btnProgress * 0.4; // glow intensity
        const btnVisible = scrollProgress > 0.15;

        return (
          <motion.div
            style={{
              position: "fixed",
              bottom: 40,
              left: 0,
              right: 0,
              zIndex: 20,
              display: "flex",
              justifyContent: "center",
              pointerEvents: btnVisible ? "auto" : "none",
            }}
            animate={{ opacity: btnVisible ? btnOpacity : 0, y: btnVisible ? 0 : 30 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              href="/map"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10 + btnProgress * 4,
                padding: `${btnPadV}px ${btnPadH}px`,
                borderRadius: btnRadius,
                fontSize: btnFontSize,
                fontWeight: 600,
                background: `rgba(0,232,123,${0.1 + btnProgress * 0.1})`,
                border: `1px solid rgba(0,232,123,${0.2 + btnProgress * 0.3})`,
                color: "#00e87b",
                textDecoration: "none",
                backdropFilter: "blur(16px)",
                boxShadow: `0 4px ${16 + btnProgress * 24}px rgba(0,232,123,${btnGlow})`,
                transition: "background 0.3s, color 0.3s",
                transform: `scale(${btnScale})`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#00e87b";
                e.currentTarget.style.color = "#07070d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `rgba(0,232,123,${0.1 + btnProgress * 0.1})`;
                e.currentTarget.style.color = "#00e87b";
              }}
            >
              🗺️ Enter Full Map Experience →
            </Link>
          </motion.div>
        );
      })()}

      {/* ═══ Network status badge (bottom-left) ═══ */}
      <motion.div
        style={{
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: 999,
          background: "rgba(10,10,20,0.7)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(8px)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollProgress > 0.3 ? 1 : 0 }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#00e87b",
            animation: "liveBlink 2s ease-in-out infinite",
          }}
        />
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          {totalReports} active reports on Solana Devnet
        </span>
      </motion.div>

      {/* ═══ Category legend (bottom-right, appears when zoomed) ═══ */}
      <motion.div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 20,
          padding: "12px 16px",
          borderRadius: 12,
          background: "rgba(10,10,20,0.7)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          pointerEvents: "none",
        }}
        animate={{ opacity: scrollProgress > 0.5 ? 1 : 0 }}
      >
        {Object.entries(CATEGORY_META).map(([key, meta]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: meta.color,
                boxShadow: `0 0 6px ${meta.color}60`,
              }}
            />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
              {meta.emoji} {meta.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Global styles */}
      <style jsx global>{`
        @keyframes liveBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
