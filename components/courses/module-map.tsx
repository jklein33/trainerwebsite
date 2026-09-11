"use client";
import { useState } from "react";
import type { Module } from "@/lib/courses/types";
export function ModuleMap({ modules }: { modules: Module[] }) {
  const [open, setOpen] = useState(false);
  if (!modules.length || modules.length > 12) return null;
  const point = (angle: number) => [
    160 + 126 * Math.cos(angle),
    160 + 126 * Math.sin(angle),
  ];
  return (
    <div className="academy-module-map">
      <button
        className="academy-secondary"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? "Hide course map" : "Explore the course map"}
      </button>
      {open && (
        <div className="academy-map-layout">
          <svg viewBox="0 0 320 320" role="group" aria-label="Choose a module">
            {modules.map((module, index) => {
              const start =
                  -Math.PI / 2 + (index * 2 * Math.PI) / modules.length,
                end = start + (2 * Math.PI) / modules.length - 0.025,
                [x1, y1] = point(start),
                [x2, y2] = point(end),
                mid = (start + end) / 2;
              return (
                <a
                  key={module.id}
                  href={`#module-${module.id}`}
                  aria-label={`Module ${index + 1}: ${module.title}`}
                >
                  <path
                    d={`M160,160 L${x1},${y1} A126,126 0 ${end - start > Math.PI ? 1 : 0},1 ${x2},${y2} Z`}
                  />
                  <text
                    x={160 + 86 * Math.cos(mid)}
                    y={166 + 86 * Math.sin(mid)}
                    textAnchor="middle"
                  >
                    {index + 1}
                  </text>
                </a>
              );
            })}
            <circle cx="160" cy="160" r="40" />
            <text
              x="160"
              y="165"
              textAnchor="middle"
              className="academy-map-center"
            >
              DS
            </text>
          </svg>
          <ol>
            {modules.map((m, i) => (
              <li key={m.id}>
                <a href={`#module-${m.id}`}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {m.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
