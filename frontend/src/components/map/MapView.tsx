import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { GeoFilter } from "../../providers/analyticsContext";
import type { CommuneMetric, SiteMetric } from "../../types/analytics";

interface MapViewProps {
  siteMetrics: SiteMetric[];
  communeMetrics: CommuneMetric[];
  onSelect: (filter: GeoFilter) => void;
  onClose: () => void;
}

const DISTRICT_COORDS: Record<string, [number, number]> = {
  "Taolagnaro": [-25.03, 46.98],
  "Ampanihy Ouest": [-24.70, 44.75],
  "Toliary-I": [-23.35, 43.68],
};

const REGION_COORDS: Record<string, [number, number]> = {
  "Anosy": [-24.75, 46.60],
  "Atsimo-Andrefana": [-23.70, 44.30],
};

const DOC_EMOJIS = ["\u{1F469}\u{1F3FB}‍⚕️", "\u{1F468}\u{1F3FE}‍⚕️", "\u{1F469}\u{1F3FD}‍⚕️", "\u{1F468}\u{1F3FB}‍⚕️", "\u{1F469}\u{1F3FE}‍⚕️"];

type ViewLevel = "district" | "region";

export default function MapView({ siteMetrics, communeMetrics, onSelect, onClose }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [viewLevel, setViewLevel] = useState<ViewLevel>("district");

  const markers = viewLevel === "district"
    ? buildDistrictMarkers(siteMetrics)
    : buildRegionMarkers(siteMetrics);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      maxBounds: [[-26.5, 42.0], [-11.0, 51.5]],
      maxBoundsViscosity: 0.85,
      minZoom: 5,
      maxZoom: 15,
      zoomControl: true,
    }).setView([-23.5, 44.5], 7);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const layerGroup = L.layerGroup().addTo(map);

    markers.forEach((m, idx) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="font-size:24px;cursor:pointer;filter:drop-shadow(0 0 5px rgba(57,255,20,0.55)) drop-shadow(0 2px 6px rgba(0,0,0,0.5));transition:transform 0.2s;line-height:1;" title="${m.label}">${DOC_EMOJIS[idx % DOC_EMOJIS.length]}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker(m.coords, { icon }).addTo(layerGroup);

      const popupContent = `
        <div style="font-family:sans-serif;font-size:13px;">
          <strong style="font-size:14px;">${m.label}</strong><br/>
          <span style="color:#8aa095;">${viewLevel === "district" ? "District" : "Region"}</span><br/>
          <span>${m.participants} participants &middot; ${m.sessions} sessions</span><br/>
          <span>${m.referrals} referrals</span><br/>
          <button onclick="window.__mafyMapSelect__('${viewLevel}','${m.label.replace(/'/g, "\\'")}')" style="margin-top:8px;padding:6px 14px;border:none;border-radius:6px;background:#39ff14;color:#020403;font-weight:600;font-size:12px;cursor:pointer;">
            Filter dashboard to ${m.label}
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "mafy-map-popup",
      });
    });

    return () => {
      layerGroup.remove();
    };
  }, [markers, viewLevel]);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__mafyMapSelect__ = (level: string, value: string) => {
      onSelect({ level: level as GeoFilter["level"], value });
    };
    return () => {
      delete (window as unknown as Record<string, unknown>).__mafyMapSelect__;
    };
  }, [onSelect]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink">
      <div className="flex items-center justify-between gap-4 border-b border-grid px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-lg">🗺️</span>
          <div>
            <h2 className="text-sm font-semibold text-white">
              MAFY Map View
            </h2>
            <p className="text-xs text-muted">
              Click a marker then select a {viewLevel} to filter the dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-grid bg-panel">
            <button
              type="button"
              onClick={() => setViewLevel("district")}
              className={`px-3 py-1.5 text-xs font-semibold uppercase transition ${
                viewLevel === "district"
                  ? "bg-neon/10 text-neon"
                  : "text-ash hover:text-white"
              }`}
            >
              District
            </button>
            <button
              type="button"
              onClick={() => setViewLevel("region")}
              className={`px-3 py-1.5 text-xs font-semibold uppercase transition ${
                viewLevel === "region"
                  ? "bg-neon/10 text-neon"
                  : "text-ash hover:text-white"
              }`}
            >
              Region
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-md border border-grid bg-panel text-ash transition hover:border-danger/40 hover:text-danger"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div ref={mapRef} className="flex-1" />

      <style>{`
        .mafy-map-popup .leaflet-popup-content-wrapper {
          background: #07110b;
          border: 1px solid rgba(57, 255, 20, 0.35);
          color: #d8ffe1;
          border-radius: 10px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.55);
        }
        .mafy-map-popup .leaflet-popup-content { margin: 10px 14px; }
        .mafy-map-popup .leaflet-popup-tip { background: #07110b; }
      `}</style>
    </div>
  );
}

interface MarkerData {
  label: string;
  coords: [number, number];
  participants: number;
  sessions: number;
  referrals: number;
}

function buildDistrictMarkers(siteMetrics: SiteMetric[]): MarkerData[] {
  const byDistrict = new Map<string, SiteMetric[]>();
  for (const site of siteMetrics) {
    const existing = byDistrict.get(site.district) ?? [];
    existing.push(site);
    byDistrict.set(site.district, existing);
  }

  const result: MarkerData[] = [];
  for (const [district, sites] of byDistrict) {
    const coords = DISTRICT_COORDS[district];
    if (!coords) continue;
    result.push({
      label: district,
      coords,
      participants: sites.reduce((t, s) => t + s.participants, 0),
      sessions: sites.reduce((t, s) => t + s.sessions, 0),
      referrals: sites.reduce((t, s) => t + s.referrals, 0),
    });
  }
  return result;
}

function buildRegionMarkers(siteMetrics: SiteMetric[]): MarkerData[] {
  const byRegion = new Map<string, SiteMetric[]>();
  for (const site of siteMetrics) {
    const existing = byRegion.get(site.region) ?? [];
    existing.push(site);
    byRegion.set(site.region, existing);
  }

  const result: MarkerData[] = [];
  for (const [region, sites] of byRegion) {
    const coords = REGION_COORDS[region];
    if (!coords) continue;
    result.push({
      label: region,
      coords,
      participants: sites.reduce((t, s) => t + s.participants, 0),
      sessions: sites.reduce((t, s) => t + s.sessions, 0),
      referrals: sites.reduce((t, s) => t + s.referrals, 0),
    });
  }
  return result;
}
