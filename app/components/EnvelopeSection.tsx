"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ENV_W = 400;
const ENV_H = 260;
const FOLD  = ENV_H * 0.48; // fold line y-position

interface Props {
  isActive: boolean;
  onScrollUp: () => void;
}

export default function EnvelopeSection({ isActive, onScrollUp }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const sectionRef  = useRef<HTMLDivElement>(null);
  const accumRef    = useRef(0);
  const lastFire    = useRef(0);
  const isActiveRef = useRef(isActive);
  const onUpRef     = useRef(onScrollUp);
  isActiveRef.current = isActive;
  onUpRef.current     = onScrollUp;

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
      if (dir < 0) onUpRef.current();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        width: "100%",
        height: "100vh",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2.4rem",
      }}
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontFamily: "var(--font-great-vibes)",
          fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
          color: "#888",
        }}
      >
        for you.
      </motion.div>

      {/* Envelope */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "relative" }}
      >
        <div
          style={{
            position: "relative",
            width: ENV_W,
            height: ENV_H,
            cursor: isOpen ? "default" : "pointer",
          }}
          onClick={() => !isOpen && setIsOpen(true)}
        >
          {/* Envelope body */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#ece8e2",
              borderRadius: 8,
              border: "1.5px solid #d5d0ca",
            }}
          />

          {/* Fold triangle overlays (decorative side + bottom folds visible on face) */}
          <svg
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            width={ENV_W}
            height={ENV_H}
            viewBox={`0 0 ${ENV_W} ${ENV_H}`}
          >
            <polygon
              points={`0,0 0,${ENV_H} ${ENV_W / 2},${FOLD}`}
              fill="#e2ded7"
              stroke="#d0cbc4"
              strokeWidth="1"
            />
            <polygon
              points={`${ENV_W},0 ${ENV_W},${ENV_H} ${ENV_W / 2},${FOLD}`}
              fill="#e6e2db"
              stroke="#d0cbc4"
              strokeWidth="1"
            />
            <polygon
              points={`0,${ENV_H} ${ENV_W},${ENV_H} ${ENV_W / 2},${FOLD}`}
              fill="#e9e5df"
              stroke="#d0cbc4"
              strokeWidth="1"
            />
          </svg>

          {/* Letter — rises from inside when open */}
          <motion.div
            initial={false}
            animate={
              isOpen
                ? { y: -300, opacity: 1 }
                : { y: ENV_H * 0.08, opacity: 0 }
            }
            transition={{
              y:       { duration: 0.85, delay: isOpen ? 0.45 : 0, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.4,  delay: isOpen ? 0.45 : 0 },
            }}
            style={{
              position: "absolute",
              left: 22,
              right: 22,
              bottom: 18,
              background: "#fff",
              borderRadius: 6,
              padding: "1.5rem 1.7rem",
              boxShadow: "0 6px 36px rgba(0,0,0,0.09)",
              border: "1px solid #f0ece8",
              pointerEvents: "none",
              zIndex: 20,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-great-vibes)",
                fontSize: "1.4rem",
                color: "#2a2828",
                lineHeight: 1.4,
                marginBottom: "0.75rem",
              }}
            >
              thomas,
            </div>
            <div
              style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: "0.62rem",
                color: "#555",
                lineHeight: 1.9,
                display: "flex",
                flexDirection: "column",
                gap: "0.55rem",
              }}
            >
              <p style={{ margin: 0 }}>
                everyday my love for you seems to grow exponentially. even when it feels like love must have some higher limit i must be close to reaching, you prove me wrong constantly.
              </p>
              <p style={{ margin: 0 }}>
                everything is better with you and when i&apos;m not with you, i see you in everything around me.
              </p>
              <p style={{ margin: 0 }}>
                i want to fall asleep in your arms and wake up and scratch your back and kiss you and watch tv on the couch in our underwear every day for the rest of my life.
              </p>
              <p style={{ margin: 0 }}>
                i literally didn&apos;t believe love like this could exist and didn&apos;t ever think it would find me until you appeared. the way you love me and care for me is really so unbelievable, i can&apos;t even come up with the words to express how grateful i am to have found you.
              </p>
            </div>
            <div
              style={{
                fontFamily: "var(--font-great-vibes)",
                fontSize: "1.2rem",
                color: "#2a2828",
                lineHeight: 1.5,
                marginTop: "0.85rem",
              }}
            >
              happy 1 year! here&apos;s to forever ♥<br />
              <span style={{ fontSize: "1rem", color: "#888" }}>yours, karen</span>
            </div>
          </motion.div>

          {/* Flap — flat top edge stays fixed, point swings back to open */}
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: FOLD + 2,
              transformOrigin: "top center",
              transformPerspective: 900,
              zIndex: 10,
            }}
            animate={{ rotateX: isOpen ? -172 : 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <svg
              width={ENV_W}
              height={FOLD + 2}
              viewBox={`0 0 ${ENV_W} ${FOLD + 2}`}
              style={{ display: "block" }}
            >
              <polygon
                points={`0,0 ${ENV_W},0 ${ENV_W / 2},${FOLD}`}
                fill="#ddd8d0"
                stroke="#d0cbc4"
                strokeWidth="1.5"
              />
            </svg>
          </motion.div>

          {/* Wax seal — sits at the triangle point, fades away as envelope opens */}
          <motion.div
            initial={false}
            animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0.75 : 1 }}
            transition={{ duration: 0.35 }}
            style={{
              position: "absolute",
              left: ENV_W / 2,
              top: FOLD,
              transform: "translate(-50%, -50%)",
              zIndex: 12,
              pointerEvents: "none",
            }}
          >
            <svg width="52" height="52" viewBox="0 0 52 52">
              {/* Outer wax ring */}
              <circle cx="26" cy="26" r="24" fill="#6B1515" />
              {/* Main seal body */}
              <circle cx="26" cy="26" r="21" fill="#8B2020" />
              {/* Embossed inner ring */}
              <circle cx="26" cy="26" r="17" fill="none" stroke="rgba(255,210,210,0.28)" strokeWidth="2" />
              {/* Heart */}
              <text
                x="26"
                y="32"
                textAnchor="middle"
                fontSize="15"
                fill="rgba(255,255,255,0.88)"
                style={{ fontFamily: "serif" }}
              >
                ♥
              </text>
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* "click to open" hint */}
      <AnimatePresence>
        {!isOpen && isActive && (
          <motion.div
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "0.58rem",
              color: "#ccc",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            click to open
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll hint */}
      <div
        style={{
          position: "absolute",
          bottom: "1.6rem",
          fontFamily: "var(--font-montserrat)",
          fontSize: "0.58rem",
          color: "#ddd",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        scroll up to go back
      </div>
    </section>
  );
}
