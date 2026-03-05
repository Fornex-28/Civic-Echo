"use client";

import React, { useCallback, useRef, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/mapbox";
import type { FillLayerSpecification, LineLayerSpecification } from "mapbox-gl";
import { CivicReport, CATEGORY_META } from "@/lib/types";

// ⚠️  Set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file.
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "YOUR_MAPBOX_TOKEN_HERE";

/** Nepal geographic bounds */
const NEPAL_BOUNDS: [[number, number], [number, number]] = [
    [80.0585, 26.3478], // SW corner
    [88.2015, 30.4227], // NE corner
];

const DEFAULT_VIEW = {
    longitude: 83.45,
    latitude: 27.7,
    zoom: 6.5,
    pitch: 50,
    bearing: -10,
};

/** Zoom threshold for style switching */
const STYLE_SWITCH_ZOOM = 10;

/** Map styles */
const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";
const SATELLITE_STYLE = "mapbox://styles/mapbox/satellite-streets-v12";

interface MapViewProps {
    reports: CivicReport[];
    onMapClick: (lat: number, lng: number) => void;
    onMarkerClick: (report: CivicReport) => void;
}

/**
 * Layer: dark overlay on all countries EXCEPT Nepal.
 */
const grayOverlayStyle: FillLayerSpecification = {
    id: "country-gray-overlay",
    type: "fill",
    source: "country-boundaries",
    "source-layer": "country_boundaries",
    filter: ["!=", ["get", "iso_3166_1"], "NP"],
    paint: {
        "fill-color": "#080812",
        "fill-opacity": 0.65,
    },
};

/**
 * Layer: glowing neon border around Nepal.
 */
const nepalBorderStyle: LineLayerSpecification = {
    id: "nepal-border-glow",
    type: "line",
    source: "country-boundaries",
    "source-layer": "country_boundaries",
    filter: ["==", ["get", "iso_3166_1"], "NP"],
    paint: {
        "line-color": "#00ff88",
        "line-width": 2.5,
        "line-opacity": 0.7,
        "line-blur": 4,
    },
};

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

/**
 * Get dynamic marker style based on echo count and status.
 */
function getMarkerStyle(report: CivicReport): { size: number; color: string; animation: string } {
    // Settled reports always show blue, regardless of echo count
    if (report.status === "settled") {
        return { size: 24, color: "#3b82f6", animation: "pulse-blue 2s ease-in-out infinite" };
    }
    if (report.upvotes >= 10) {
        return { size: 36, color: "#22c55e", animation: "pulse-green 1.5s ease-in-out infinite" };
    }
    if (report.upvotes >= 5) {
        return { size: 28, color: "#eab308", animation: "pulse-yellow 2s ease-in-out infinite" };
    }
    if (report.upvotes >= 3) {
        return { size: 22, color: "#f97316", animation: "pulse-orange 2s ease-in-out infinite" };
    }
    return { size: 16, color: "#ff3b5c", animation: "pulse-red 2s ease-in-out infinite" };
}

export default function MapView({ reports, onMapClick, onMarkerClick }: MapViewProps) {
    const mapRef = useRef<MapRef>(null);
    const [mapStyle, setMapStyle] = useState(DARK_STYLE);
    const [hoveredReport, setHoveredReport] = useState<CivicReport | null>(null);

    // Track whether we are currently switching to avoid rapid re-triggers
    const isSwitchingRef = useRef(false);

    const handleClick = useCallback(
        (e: any) => {
            const features = e.target.queryRenderedFeatures(e.point);
            if (features.length > 0) return;
            onMapClick(e.lngLat.lat, e.lngLat.lng);
        },
        [onMapClick]
    );

    /**
     * Switch map style based on current zoom level.
     */
    const handleZoom = useCallback((e: ViewStateChangeEvent) => {
        if (isSwitchingRef.current) return;

        const zoom = e.viewState.zoom;
        const targetStyle = zoom >= STYLE_SWITCH_ZOOM ? SATELLITE_STYLE : DARK_STYLE;

        setMapStyle((prev) => {
            if (prev !== targetStyle) {
                isSwitchingRef.current = true;
                return targetStyle;
            }
            return prev;
        });
    }, []);

    /**
     * After every style load: re-apply 3D terrain, sky, country overlay, border glow, and 3D buildings.
     */
    const applyCustomLayers = useCallback(() => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        isSwitchingRef.current = false;

        // ── 3D Terrain ──
        if (!map.getSource("mapbox-dem")) {
            map.addSource("mapbox-dem", {
                type: "raster-dem",
                url: "mapbox://mapbox.mapbox-terrain-dem-v1",
                tileSize: 512,
                maxzoom: 14,
            });
        }
        map.setTerrain({ source: "mapbox-dem", exaggeration: 2.0 });

        // ── Atmospheric Sky ──
        if (!map.getLayer("sky")) {
            map.addLayer({
                id: "sky",
                type: "sky",
                paint: {
                    "sky-type": "atmosphere",
                    "sky-atmosphere-sun": [0.0, 15.0],
                    "sky-atmosphere-sun-intensity": 15,
                },
            } as any);
        }

        // ── Country boundaries source ──
        if (!map.getSource("country-boundaries")) {
            map.addSource("country-boundaries", {
                type: "vector",
                url: "mapbox://mapbox.country-boundaries-v1",
            });
        }

        // ── Gray overlay on non-Nepal countries ──
        if (!map.getLayer("country-gray-overlay")) {
            map.addLayer(grayOverlayStyle);
        }

        // ── Nepal border glow ──
        if (!map.getLayer("nepal-border-glow")) {
            map.addLayer(nepalBorderStyle);
        }

        // ── 3D Buildings ──
        const layers = map.getStyle()?.layers;
        let labelLayerId: string | undefined;
        if (layers) {
            for (const layer of layers) {
                if (layer.type === "symbol" && (layer as any).layout?.["text-field"]) {
                    labelLayerId = layer.id;
                    break;
                }
            }
        }

        if (!map.getLayer("3d-buildings")) {
            map.addLayer(
                {
                    id: "3d-buildings",
                    source: "composite",
                    "source-layer": "building",
                    filter: ["==", "extrude", "true"],
                    type: "fill-extrusion",
                    minzoom: 12,
                    paint: {
                        "fill-extrusion-color": [
                            "interpolate",
                            ["linear"],
                            ["get", "height"],
                            0, "#1a1a2e",
                            50, "#2a2a4e",
                            200, "#3a3a6e",
                        ],
                        "fill-extrusion-height": [
                            "interpolate", ["linear"], ["zoom"],
                            12, 0,
                            14, ["get", "height"],
                        ],
                        "fill-extrusion-base": [
                            "interpolate", ["linear"], ["zoom"],
                            12, 0,
                            14, ["get", "min_height"],
                        ],
                        "fill-extrusion-opacity": 0.75,
                    },
                } as any,
                labelLayerId
            );
        }
    }, []);

    return (
        <Map
            ref={mapRef}
            initialViewState={DEFAULT_VIEW}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle={mapStyle}
            maxBounds={NEPAL_BOUNDS}
            style={{ width: "100%", height: "100%" }}
            onClick={handleClick}
            onStyleData={applyCustomLayers}
            onZoom={handleZoom}
            minZoom={5}
            maxZoom={18}
            attributionControl={false}
            terrain={{ source: "mapbox-dem", exaggeration: 2.0 }}
        >
            <NavigationControl position="top-right" showCompass visualizePitch />

            {reports.map((report) => {
                const meta = CATEGORY_META[report.category] ?? CATEGORY_META.other;
                const marker = getMarkerStyle(report);
                return (
                    <Marker
                        key={report.id}
                        latitude={report.locationLat}
                        longitude={report.locationLng}
                        anchor="center"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            onMarkerClick(report);
                        }}
                    >
                        <div
                            onMouseEnter={() => setHoveredReport(report)}
                            onMouseLeave={() => setHoveredReport(null)}
                            style={{
                                width: marker.size,
                                height: marker.size,
                                borderRadius: "50%",
                                background: `radial-gradient(circle, ${marker.color} 0%, ${marker.color}44 100%)`,
                                border: `2px solid ${marker.color}`,
                                boxShadow: `0 0 ${marker.size * 0.5}px ${marker.color}55`,
                                cursor: "pointer",
                                display: "grid",
                                placeItems: "center",
                                fontSize: Math.max(10, marker.size * 0.4),
                                animation: marker.animation,
                                transition: "transform 0.15s",
                            }}
                        >
                            {marker.size >= 20 ? meta.emoji : ""}
                        </div>
                    </Marker>
                );
            })}

            {/* ── Hover Popup ── */}
            {hoveredReport && (
                <Popup
                    latitude={hoveredReport.locationLat}
                    longitude={hoveredReport.locationLng}
                    closeButton={false}
                    closeOnClick={false}
                    anchor="bottom"
                    offset={20}
                    className="map-hover-popup"
                >
                    <div
                        style={{
                            background: "rgba(12, 12, 24, 0.96)",
                            backdropFilter: "blur(16px)",
                            borderRadius: 12,
                            overflow: "hidden",
                            width: 260,
                            border: "1px solid var(--line)",
                        }}
                    >
                        {/* Image */}
                        {hoveredReport.imageUrl && (
                            <img
                                src={hoveredReport.imageUrl}
                                alt={hoveredReport.title}
                                style={{
                                    width: "100%",
                                    height: 120,
                                    objectFit: "cover",
                                }}
                            />
                        )}

                        <div style={{ padding: "10px 12px" }}>
                            {/* Category + Echoes */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    background: `${CATEGORY_META[hoveredReport.category]?.color || "#06b6d4"}20`,
                                    color: CATEGORY_META[hoveredReport.category]?.color || "#06b6d4",
                                }}>
                                    {CATEGORY_META[hoveredReport.category]?.emoji} {CATEGORY_META[hoveredReport.category]?.label}
                                </span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>
                                    ▲ {hoveredReport.upvotes}
                                </span>
                            </div>

                            {/* Title */}
                            <p style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--text-1)",
                                lineHeight: 1.35,
                                margin: "0 0 6px",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}>
                                {hoveredReport.title}
                            </p>

                            {/* Location + Time */}
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-3)" }}>
                                <span>📍 {hoveredReport.district}, W{hoveredReport.wardNumber}</span>
                                <span>{timeAgo(hoveredReport.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </Popup>
            )}
        </Map>
    );
}
