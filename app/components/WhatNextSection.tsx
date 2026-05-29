"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Replace the src below with your Google My Maps embed URL
// (Open your map → Share → Embed on my site → copy the src value)
const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.1583086943!2d-74.11976397304903!3d40.697663748744296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3Ac80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1748468000000!5m2!1sen!2sus";

const MAP_LINK = "https://maps.app.goo.gl/"; // replace with your shareable map link

interface Props {
  isActive: boolean;
  onScrollUp: () => void;
}

export default function WhatNextSection({ isActive, onScrollUp }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const accumRef   = useRef(0);
  const lastFire   = useRef(0);
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
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "min(900px, 90vw)",
          display: "flex",
          flexDirection: "column",
          gap: "1.6rem",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: "var(--font-great-vibes)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
            color: "#888",
            lineHeight: 1,
          }}
        >
          what&apos;s next?
        </div>

        {/* Map + image row */}
        <div style={{ display: "flex", gap: "1.4rem", alignItems: "stretch" }}>
          {/* Map */}
          <div
            style={{
              flex: "1 1 0",
              minHeight: 380,
              borderRadius: 12,
              overflow: "hidden",
              border: "1.5px solid #eee",
              position: "relative",
            }}
          >
            <iframe
              src={MAP_EMBED_SRC}
              width="100%"
              height="100%"
              style={{ display: "block", border: 0, minHeight: 380 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="NYC things to do"
            />
          </div>

          {/* Placeholder image */}
          <div
            style={{
              width: "clamp(160px, 22vw, 260px)",
              flexShrink: 0,
              borderRadius: 12,
              border: "1.5px dashed #ddd",
              background: "#fafafa",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ccc"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: "0.6rem",
                color: "#ccc",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              photo
            </span>
          </div>
        </div>

        {/* Map link */}
        <a
          href={MAP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-montserrat)",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "#111",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            borderBottom: "1.5px solid #111",
            paddingBottom: "0.1rem",
            width: "fit-content",
          }}
        >
          open in google maps
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 10L10 2M10 2H5M10 2V7" />
          </svg>
        </a>

        {/* Scroll hint */}
        <div
          style={{
            fontFamily: "var(--font-montserrat)",
            fontSize: "0.6rem",
            color: "#ddd",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          scroll up to go back
        </div>
      </motion.div>
    </section>
  );
}
