"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MILESTONES = [
  { num: "01", label: "meeting on the red line" },
  { num: "02", label: "pickleball" },
  { num: "03", label: "first date" },
  { num: "04", label: "making it official" },
  { num: "05", label: "moving into pt" },
  { num: "06", label: "lolla" },
  { num: "07", label: "seattle" },
  { num: "08", label: "northcoast" },
  { num: "09", label: "cooking gyoza" },
  { num: "10", label: "nyc visit" },
  { num: "11", label: "bea" },
  { num: "12", label: "apples" },
  { num: "13", label: "halloween" },
  { num: "14", label: "bowling" },
  { num: "15", label: "your bday" },
  { num: "16", label: "ice skating" },
  { num: "17", label: "mammoth" },
  { num: "18", label: "seahawks game" },
  { num: "19", label: "knitting" },
  { num: "20", label: "nye" },
  { num: "21", label: "japan" },
  { num: "22", label: "bakeries" },
  { num: "23", label: "edc" },
  { num: "24", label: "365 days" },
];

const N     = MILESTONES.length;
const STEP  = 360 / N; // 15° per item

// Wheel geometry (all in SVG px)
const S       = 580;   // SVG canvas size
const CX      = S / 2; // 290
const CY      = S / 2; // 290
const GEAR_R  = 244;   // wheel body radius
const TOOTH_H = 19;    // gear tooth height
const GEAR_O  = GEAR_R + TOOTH_H; // outer tip radius = 263
const N_TEETH = 48;    // gear teeth count
const ITEM_R  = 198;   // radius where item text sits
const RING_R  = ITEM_R + 28; // decorative ring
const HOLE_R  = 38;    // center pivot hole

// Pre-compute gear path at module load
function buildGear(): string {
  const step = (2 * Math.PI) / N_TEETH;
  const hw   = step * 0.21; // half-tooth arc width
  let d = "";
  for (let i = 0; i < N_TEETH; i++) {
    const a  = -Math.PI / 2 + i * step;
    const a0 = a - step / 2 + hw * 1.05;
    const a1 = a - hw;
    const a2 = a + hw;
    const a3 = a + step / 2 - hw * 1.05;
    const ri = GEAR_R, ro = GEAR_O;
    const pt = (r: number, ang: number) => `${CX + r * Math.cos(ang)},${CY + r * Math.sin(ang)}`;
    d += (i === 0 ? `M` : ` L`) + pt(ri, a0);
    d += ` L${pt(ro, a1)} L${pt(ro, a2)} L${pt(ri, a3)}`;
  }
  return d + " Z";
}
const GEAR_PATH = buildGear();

function idxFromRot(rot: number): number {
  return ((Math.round(-rot / STEP) % N) + N) % N;
}

// Window aperture geometry
const WIN_W = 108, WIN_H = 48;
const WIN_X = CX - WIN_W / 2;
const WIN_Y = CY - ITEM_R - WIN_H / 2 + 3;

interface Props {
  isActive: boolean;
  onScrollUp: () => void;
  onScrollDown: () => void;
}

export default function WheelSection({ isActive, onScrollUp, onScrollDown }: Props) {
  const [rotation,  setRotation]  = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dragging,  setDragging]  = useState(false);
  const [snapping,  setSnapping]  = useState(false);

  const rotRef      = useRef(0);
  const dragRef     = useRef(false);
  const startAng    = useRef(0);
  const startRot    = useRef(0);
  const snapTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelRef    = useRef<HTMLDivElement>(null);
  const sectionRef  = useRef<HTMLDivElement>(null);
  const accumRef    = useRef(0);
  const lastFire    = useRef(0);

  const isActiveRef  = useRef(isActive);
  const onUpRef      = useRef(onScrollUp);
  const onDownRef    = useRef(onScrollDown);
  isActiveRef.current = isActive;
  onUpRef.current     = onScrollUp;
  onDownRef.current   = onScrollDown;

  const getAngle = useCallback((cx: number, cy: number) => {
    const el = wheelRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.atan2(cy - (r.top + r.height / 2), cx - (r.left + r.width / 2)) * (180 / Math.PI);
  }, []);

  const snap = useCallback(() => {
    const idx    = idxFromRot(rotRef.current);
    const target = -idx * STEP;
    if (snapTimer.current) clearTimeout(snapTimer.current);
    setSnapping(true);
    setRotation(target);
    rotRef.current = target;
    setActiveIdx(idx);
    snapTimer.current = setTimeout(() => setSnapping(false), 450);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isActiveRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (snapTimer.current) clearTimeout(snapTimer.current);
    setSnapping(false);
    dragRef.current = true;
    setDragging(true);
    startAng.current = getAngle(e.clientX, e.clientY);
    startRot.current = rotRef.current;
  }, [getAngle]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    let delta = getAngle(e.clientX, e.clientY) - startAng.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const newRot = startRot.current + delta;
    setRotation(newRot);
    rotRef.current = newRot;
    setActiveIdx(idxFromRot(newRot));
  }, [getAngle]);

  const onPointerUp = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = false;
    setDragging(false);
    snap();
  }, [snap]);

  // Scroll → slide navigation only (drag handles memory navigation)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!isActiveRef.current) return;
      e.preventDefault();
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 40;
      if (e.deltaMode === 2) d *= 800;
      accumRef.current += d;
      const now = Date.now();
      if (Math.abs(accumRef.current) < 40 || now - lastFire.current < 700) return;
      lastFire.current = now + 700;
      const dir = accumRef.current > 0 ? 1 : -1;
      accumRef.current = 0;
      if (dir < 0) onUpRef.current(); else onDownRef.current();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ width: "100%", height: "100vh", background: "#f8f8f6", position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}
    >
      {/* ── Volvelle wheel ── */}
      <div style={{ position: "absolute", left: "38%", top: "50%", transform: "translate(-50%, -50%)", width: S, height: S, userSelect: "none" }}>

        {/* Rotating disk */}
        <div
          ref={wheelRef}
          style={{
            position: "absolute", inset: 0,
            transform: `rotate(${rotation}deg)`,
            transition: snapping ? "transform 0.45s cubic-bezier(0.22,1,0.36,1)" : "none",
            cursor: dragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}>
            {/* Gear silhouette */}
            <path d={GEAR_PATH} fill="#edecea" stroke="#cccac8" strokeWidth="0.7"/>
            {/* Wheel face */}
            <circle cx={CX} cy={CY} r={GEAR_R} fill="#f4f4f2"/>
            {/* Outer decorative ring */}
            <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke="#dddbd9" strokeWidth="1.2"/>
            {/* Inner ring */}
            <circle cx={CX} cy={CY} r={HOLE_R + 18} fill="none" stroke="#dddbd9" strokeWidth="0.8"/>
            {/* Center pivot */}
            <circle cx={CX} cy={CY} r={HOLE_R}      fill="#e4e2e0" stroke="#c8c6c4" strokeWidth="1"/>
            <circle cx={CX} cy={CY} r={HOLE_R - 11} fill="#efefed"/>
            <circle cx={CX} cy={CY} r={7}            fill="#b8b6b4"/>

            {/* Divider ticks at each item slot */}
            {Array.from({ length: N }, (_, i) => {
              const a = (i * STEP - 90) * Math.PI / 180;
              return (
                <line
                  key={i}
                  x1={CX + (RING_R - 4) * Math.cos(a)} y1={CY + (RING_R - 4) * Math.sin(a)}
                  x2={CX + (RING_R + 4) * Math.cos(a)} y2={CY + (RING_R + 4) * Math.sin(a)}
                  stroke="#c8c6c4" strokeWidth="1"
                />
              );
            })}

            {/* Memory items */}
            {MILESTONES.map((item, i) => {
              const deg = i * STEP;
              const rad = (deg - 90) * Math.PI / 180;
              const tx  = CX + ITEM_R * Math.cos(rad);
              const ty  = CY + ITEM_R * Math.sin(rad);
              return (
                <g key={i} transform={`translate(${tx},${ty}) rotate(${deg})`}>
                  <text y="-3" textAnchor="middle"
                    style={{ fontFamily: "var(--font-montserrat)", fontSize: "11px", fontWeight: 700, fill: "#2e2e2e", letterSpacing: "-0.01em" }}>
                    {item.num}
                  </text>
                  <text y="9" textAnchor="middle"
                    style={{ fontFamily: "var(--font-montserrat)", fontSize: "6px", fontWeight: 400, fill: "#999", letterSpacing: "0.03em" }}>
                    {item.label.slice(0, 14)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Fixed window layer — does NOT rotate */}
        <svg
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }}
          width={S} height={S} viewBox={`0 0 ${S} ${S}`}
        >
          <defs>
            <mask id="vol-mask">
              {/* Frosted over the whole circle… */}
              <circle cx={CX} cy={CY} r={GEAR_R} fill="white"/>
              {/* …except the aperture window */}
              <rect x={WIN_X} y={WIN_Y} width={WIN_W} height={WIN_H} rx={5} fill="black"/>
            </mask>
          </defs>

          {/* Frosted overlay */}
          <rect width={S} height={S} fill="rgba(244,244,242,0.74)" mask="url(#vol-mask)"/>

          {/* Window frame */}
          <rect x={WIN_X} y={WIN_Y} width={WIN_W} height={WIN_H} rx={5}
            fill="none" stroke="#3c3c3c" strokeWidth="1.6"/>

          {/* Pointer arrow below window */}
          <polygon
            points={`${CX - 5},${WIN_Y + WIN_H + 2} ${CX + 5},${WIN_Y + WIN_H + 2} ${CX},${WIN_Y + WIN_H + 10}`}
            fill="#3c3c3c"
          />

          {/* "DRAG" label at bottom of wheel face */}
          <text x={CX} y={CY + GEAR_R - 22} textAnchor="middle"
            style={{ fontFamily: "var(--font-montserrat)", fontSize: "7px", fontWeight: 600, fill: "#bbb", letterSpacing: "0.25em" }}>
            DRAG TO ROTATE
          </text>
        </svg>
      </div>

      {/* ── Right panel: active memory details ── */}
      <div style={{ position: "absolute", left: "62%", top: "50%", transform: "translateY(-50%)", width: "30%", maxWidth: 300 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            {/* Placeholder image */}
            <div style={{
              width: "100%", aspectRatio: "4/3",
              background: "#ececea", border: "1.5px dashed #ccc",
              borderRadius: 10, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              marginBottom: "1.1rem", gap: 8,
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                stroke="#c0c0c0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span style={{ fontFamily: "var(--font-montserrat)", fontSize: "0.58rem", color: "#c0c0c0", letterSpacing: "0.12em", textTransform: "uppercase" }}>photo</span>
            </div>

            <div style={{ fontFamily: "var(--font-montserrat)", fontSize: "0.68rem", fontWeight: 600, color: "#aaa", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "0.6rem" }}>
              memory {MILESTONES[activeIdx].num}
            </div>
            <div style={{ fontFamily: "var(--font-great-vibes)", fontSize: "clamp(1.8rem, 2.8vw, 2.6rem)", color: "#111", lineHeight: 1.25 }}>
              {MILESTONES[activeIdx].label}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom hint */}
      <div style={{
        position: "absolute", bottom: "1.6rem", left: "50%", transform: "translateX(-50%)",
        fontFamily: "var(--font-montserrat)", fontSize: "0.58rem", color: "#ccc",
        letterSpacing: "0.18em", textTransform: "uppercase", pointerEvents: "none", whiteSpace: "nowrap",
      }}>
        drag wheel · scroll to navigate
      </div>
    </section>
  );
}
