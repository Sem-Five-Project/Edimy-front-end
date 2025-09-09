"use client";

import jsVectorMap from "jsvectormap";
import { useEffect, useRef, useState } from "react";

import "@/js/us-aea-en";

export default function Map() {
  const mapRef = useRef<jsVectorMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapId] = useState(() => `map-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Clean up any existing map instance
    if (mapRef.current) {
      try {
        mapRef.current.destroy();
      } catch (e) {
        console.warn("Error destroying map:", e);
      }
      mapRef.current = null;
    }

    // Clear the container and create new map element
    if (containerRef.current) {
      containerRef.current.innerHTML = `<div id="${mapId}" class="mapOne map-btn" />`;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        // Create new map instance
        mapRef.current = new jsVectorMap({
          selector: `#${mapId}`,
          map: "us_aea_en",
          zoomButtons: true,
          regionStyle: {
            initial: {
              fill: "#C8D0D8",
            },
            hover: {
              fillOpacity: 1,
              fill: "#3056D3",
            },
          },
          regionLabelStyle: {
            initial: {
              fontWeight: "semibold",
              fill: "#fff",
            },
            hover: {
              cursor: "pointer",
            },
          },
          labels: {
            regions: {
              render(code: string) {
                return code.split("-")[1];
              },
            },
          },
        });
      } catch (e) {
        console.error("Error creating map:", e);
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.destroy();
        } catch (e) {
          console.warn("Error destroying map on cleanup:", e);
        }
        mapRef.current = null;
      }
    };
  }, [mapId]);

  return (
    <div className="h-[422px]" ref={containerRef}>
      <div id={mapId} className="mapOne map-btn" />
    </div>
  );
}
