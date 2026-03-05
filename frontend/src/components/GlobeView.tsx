"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CivicReport, CATEGORY_META } from "@/lib/types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/* ─── Nepal center & bounds ─── */
const NEPAL_CENTER: [number, number] = [84.1, 28.4];
const GLOBE_ZOOM = 2.2;
const NEPAL_ZOOM = 7;

interface GlobeViewProps {
    reports: CivicReport[];
    scrollProgress: number; // 0..1 — drives zoom from globe to Nepal
}

export default function GlobeView({ reports, scrollProgress }: GlobeViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const rotationRef = useRef<number | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    /* Initialize Mapbox globe */
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [40, 20],
            zoom: GLOBE_ZOOM,
            projection: "globe" as any,
            attributionControl: false,
            interactive: false,
        });

        // Shift globe to the right side of the viewport
        map.setPadding({ left: 400, top: 0, right: 0, bottom: 0 });

        map.on("style.load", () => {
            // Atmosphere glow — bright Helium-style halo
            map.setFog({
                color: "rgb(8, 8, 18)",
                "high-color": "rgb(40, 80, 160)",
                "horizon-blend": 0.12,
                "space-color": "rgb(8, 8, 18)",
                "star-intensity": 0.8,
            });

            setMapLoaded(true);
        });

        mapRef.current = map;

        return () => {
            if (rotationRef.current) cancelAnimationFrame(rotationRef.current);
            markersRef.current.forEach((m) => m.remove());
            map.remove();
            mapRef.current = null;
        };
    }, []);

    /* Auto-rotation when at globe level */
    useEffect(() => {
        if (!mapRef.current || !mapLoaded) return;

        let spinning = true;

        function rotate() {
            if (!mapRef.current || !spinning) return;
            const center = mapRef.current.getCenter();
            center.lng += 0.08;
            mapRef.current.setCenter(center);
            rotationRef.current = requestAnimationFrame(rotate);
        }

        // Only spin when at globe level (scrollProgress near 0)
        if (scrollProgress < 0.05) {
            spinning = true;
            rotate();
        } else {
            spinning = false;
            if (rotationRef.current) {
                cancelAnimationFrame(rotationRef.current);
                rotationRef.current = null;
            }
        }

        return () => {
            spinning = false;
            if (rotationRef.current) {
                cancelAnimationFrame(rotationRef.current);
                rotationRef.current = null;
            }
        };
    }, [scrollProgress, mapLoaded]);

    /* Scroll-driven zoom: interpolate from globe → Nepal */
    useEffect(() => {
        if (!mapRef.current || !mapLoaded) return;

        const map = mapRef.current;

        // Ease function for cinematic feel
        const eased = easeInOutCubic(scrollProgress);

        const zoom = GLOBE_ZOOM + (NEPAL_ZOOM - GLOBE_ZOOM) * eased;
        const startLng = map.getCenter().lng;
        const targetLng = NEPAL_CENTER[0];
        const targetLat = NEPAL_CENTER[1];

        // Interpolate center toward Nepal
        const lng = lerp(scrollProgress < 0.05 ? startLng : startLng, targetLng, eased);
        const lat = lerp(20, targetLat, eased);

        map.jumpTo({
            center: [scrollProgress < 0.1 ? map.getCenter().lng : lng, lat],
            zoom,
        });

        // When mostly zoomed in, snap center to Nepal
        if (scrollProgress > 0.3) {
            map.jumpTo({
                center: [lerp(map.getCenter().lng, NEPAL_CENTER[0], eased), lerp(map.getCenter().lat, NEPAL_CENTER[1], eased)],
                zoom,
            });
        }
    }, [scrollProgress, mapLoaded]);

    /* Add report markers — only visible when zoomed into Nepal */
    useEffect(() => {
        if (!mapRef.current || !mapLoaded) return;

        // Only show markers when deeply zoomed into Nepal (scrollProgress > 0.6)
        if (scrollProgress < 0.6) {
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];
            return;
        }

        // Don't re-create if markers already exist
        if (markersRef.current.length > 0) {
            // Just update opacity based on progress
            const opacity = Math.min(1, (scrollProgress - 0.6) / 0.15);
            markersRef.current.forEach((m) => {
                const el = m.getElement();
                el.style.opacity = String(opacity);
            });
            return;
        }

        // Nepal bounding box filter
        const NEPAL_BOUNDS = { minLat: 26.3, maxLat: 30.5, minLng: 80.0, maxLng: 88.2 };
        const nepalReports = reports.filter(
            (r) =>
                r.locationLat >= NEPAL_BOUNDS.minLat &&
                r.locationLat <= NEPAL_BOUNDS.maxLat &&
                r.locationLng >= NEPAL_BOUNDS.minLng &&
                r.locationLng <= NEPAL_BOUNDS.maxLng
        );

        nepalReports.forEach((report, i) => {
            const meta = CATEGORY_META[report.category] ?? CATEGORY_META.other;

            // Create marker wrapper with pulsing ring
            const wrapper = document.createElement("div");
            wrapper.style.cssText = `
                position: relative;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            // Pulsing outer ring
            const ring = document.createElement("div");
            ring.style.cssText = `
                position: absolute;
                inset: 0;
                border-radius: 50%;
                border: 2px solid ${meta.color}60;
                animation: markerRing 2.5s ease-out infinite;
                animation-delay: ${i * 0.3}s;
            `;
            wrapper.appendChild(ring);

            // Core dot
            const el = document.createElement("div");
            el.style.cssText = `
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: ${meta.color};
                border: 2.5px solid rgba(255,255,255,0.5);
                box-shadow: 0 0 14px ${meta.color}, 0 0 28px ${meta.color}80, 0 0 42px ${meta.color}40;
                cursor: pointer;
                transition: transform 0.2s;
                animation: markerPulse 3s ease-in-out infinite;
                animation-delay: ${i * 0.2}s;
                z-index: 2;
                position: relative;
            `;
            wrapper.appendChild(el);

            wrapper.addEventListener("mouseenter", () => {
                el.style.transform = "scale(1.5)";
                wrapper.style.zIndex = "10";
            });
            wrapper.addEventListener("mouseleave", () => {
                el.style.transform = "scale(1)";
                wrapper.style.zIndex = "1";
            });

            const marker = new mapboxgl.Marker({ element: wrapper })
                .setLngLat([report.locationLng, report.locationLat])
                .setPopup(
                    new mapboxgl.Popup({
                        offset: 12,
                        closeButton: false,
                        className: "globe-popup",
                    }).setHTML(`
            <div style="
              background: rgba(12,12,24,0.95);
              backdrop-filter: blur(12px);
              border: 1px solid ${meta.color}40;
              border-radius: 10px;
              padding: 12px 16px;
              min-width: 180px;
            ">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
                <span style="
                  font-size:10px;font-weight:600;padding:2px 8px;border-radius:999px;
                  background:${meta.color}20;color:${meta.color};
                ">${meta.emoji} ${meta.label}</span>
                <span style="font-size:10px;color:rgba(255,255,255,0.4);margin-left:auto">▲${report.upvotes}</span>
              </div>
              <p style="font-size:12px;font-weight:600;color:#fff;margin:0;line-height:1.4">${report.title}</p>
              <p style="font-size:10px;color:rgba(255,255,255,0.4);margin:4px 0 0">
                📍 ${report.district}, Ward ${report.wardNumber}
              </p>
            </div>
          `)
                )
                .addTo(mapRef.current!);

            markersRef.current.push(marker);
        });
    }, [reports, mapLoaded, scrollProgress]);

    return (
        <>
            <div
                ref={containerRef}
                style={{
                    position: "fixed",
                    inset: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: 0,
                }}
            />
            {/* CSS for marker pulse */}
            <style jsx global>{`
        @keyframes markerPulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes markerRing {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .globe-popup .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
          border-radius: 10px !important;
        }
        .globe-popup .mapboxgl-popup-tip {
          border-top-color: rgba(12,12,24,0.95) !important;
        }
      `}</style>
        </>
    );
}

/* ─── Utils ─── */
function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
