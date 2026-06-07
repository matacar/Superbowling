"use client";

import type { LaneAvailability, LaneCellStatus } from "@/lib/reservations/types";

/**
 * Maqueta visual de la bolera. Cada pista se dibuja en SVG con perspectiva:
 * pin deck con 10 bolos al fondo, flechas de tiro, superficie tipo madera y la
 * zona de aproximación con la bola de retorno en el extremo cercano.
 *
 * Estados (derivados de los tokens en globals.css):
 *  - free    → seleccionable, con glow de acento al hover.
 *  - held    → bloqueada temporalmente (token lane-held), no seleccionable.
 *  - booked  → reservada/ocupada, atenuada, no seleccionable.
 *
 * Accesible: cada pista es un <button> navegable por teclado, con aria-label,
 * aria-pressed y foco visible. Las animaciones respetan prefers-reduced-motion.
 */

// Posiciones de los 10 bolos (formación triangular en el pin deck).
const PINS: [number, number][] = [
  [20, 20], [28, 20], [36, 20], [44, 20], // fila trasera (4)
  [24, 30], [32, 30], [40, 30],           // fila 3
  [28, 40], [36, 40],                     // fila 2
  [32, 50],                               // bolo cabeza (1)
];

// Tablas de la pista que convergen hacia el fondo (efecto de perspectiva).
// Cada par es [x en el extremo cercano, x en el fondo].
const BOARDS: [number, number][] = [
  [17, 23], [24.5, 27.5], [32, 32], [39.5, 36.5], [47, 41],
];

// Flechas de tiro, en formación de "V" apuntando hacia los bolos.
const ARROWS: [number, number][] = [
  [32, 150],
  [26, 158], [38, 158],
  [21, 166], [43, 166],
  [16.5, 174], [47.5, 174],
];

function statusLabel(s: LaneCellStatus): string {
  return s === "free" ? "disponible" : s === "held" ? "bloqueada" : "reservada";
}
function shortLabel(s: LaneCellStatus): string {
  return s === "free" ? "Libre" : s === "held" ? "Ocupada" : "Reservada";
}

function LaneArt() {
  return (
    <svg className="lane__art" viewBox="0 0 64 220" aria-hidden="true">
      {/* Canaletas / fondo */}
      <rect x="0" y="0" width="64" height="220" rx="6" fill="var(--lane-gutter)" />

      {/* Superficie de la pista (trapecio en perspectiva) */}
      <polygon points="16,4 48,4 58,214 6,214" fill="var(--lane-surface)" />

      {/* Tablas convergentes */}
      {BOARDS.map(([bottom, top], i) => (
        <line
          key={i}
          x1={bottom}
          y1={214}
          x2={top}
          y2={5}
          stroke="var(--lane-board)"
          strokeWidth={0.6}
        />
      ))}

      {/* Barra superior tipo "masking unit" (aquí va el número de pista) */}
      <polygon points="16,4 48,4 48.6,16 15.4,16" fill="var(--lane-gutter)" />

      {/* Pin deck al fondo */}
      <polygon points="15.4,16 48.6,16 50.6,58 13.4,58" fill="var(--lane-deck)" />

      {/* 10 bolos */}
      <g>
        {PINS.map(([cx, cy], i) => (
          <ellipse
            key={i}
            className="lane__pin"
            cx={cx}
            cy={cy}
            rx={1.7}
            ry={2.5}
            fill="var(--pin)"
            style={{ animationDelay: `${i * 0.025}s` }}
          />
        ))}
      </g>

      {/* Flechas de tiro */}
      <g>
        {ARROWS.map(([cx, cy], i) => (
          <polygon
            key={i}
            points={`${cx},${cy} ${cx - 2.4},${cy + 5} ${cx + 2.4},${cy + 5}`}
            fill="var(--lane-arrow)"
          />
        ))}
      </g>

      {/* Línea de falta */}
      <line x1="7.4" y1="184" x2="56.6" y2="184" stroke="var(--lane-line)" strokeWidth={1} />

      {/* Aproximación (zona cercana) */}
      <polygon points="7.4,184 56.6,184 58,214 6,214" fill="var(--lane-approach)" />

      {/* Bola de retorno */}
      <circle cx="32" cy="201" r="4.6" fill="var(--ball)" />
      <circle cx="30.6" cy="199.4" r="0.5" fill="var(--lane-gutter)" />
      <circle cx="33.2" cy="199.6" r="0.5" fill="var(--lane-gutter)" />
      <circle cx="32" cy="202.2" r="0.5" fill="var(--lane-gutter)" />
    </svg>
  );
}

function BowlingLane({
  lane,
  selected,
  onSelect,
}: {
  lane: LaneAvailability;
  selected: boolean;
  onSelect: (laneId: number) => void;
}) {
  const isFree = lane.status === "free";
  const cls = selected ? "lane--selected" : `lane--${lane.status}`;
  return (
    <button
      type="button"
      disabled={!isFree}
      aria-pressed={selected}
      aria-label={`Pista ${lane.laneId}: ${statusLabel(lane.status)}`}
      onClick={() => onSelect(lane.laneId)}
      className={`lane ${cls}`}
    >
      <LaneArt />
      <span className="lane__num">{lane.laneId}</span>
      <span className="lane__tag">{selected ? "Elegida" : shortLabel(lane.status)}</span>
      {selected && (
        <span className="lane__check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

export default function LaneGrid({
  lanes,
  selected,
  onSelect,
}: {
  lanes: LaneAvailability[];
  selected: number | null;
  onSelect: (laneId: number) => void;
}) {
  return (
    <div
      className="alley no-scrollbar"
      role="group"
      aria-label="Selección de pista"
    >
      <div className="alley__lanes">
        {lanes.map((l) => (
          <BowlingLane
            key={l.laneId}
            lane={l}
            selected={selected === l.laneId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
