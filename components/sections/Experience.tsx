"use client";

import { useCallback, useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { useSceneStore } from "@/store/sceneStore";
import { experienceEras, type ExperienceEra } from "@/content/experience";

export default function Experience() {
  const reducedMotion = useReducedMotion();
  const { setHighlightNodeIds, clearHighlightNodeIds } = useSceneStore();
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEraHover = useCallback(
    (era: ExperienceEra) => {
      if (era.connectedNodeIds && era.connectedNodeIds.length > 0) {
        setHighlightNodeIds(era.connectedNodeIds);
        
        // Debounce pulse emission to avoid too many pulses
        if (pulseTimeoutRef.current) {
          clearTimeout(pulseTimeoutRef.current);
        }
        
        pulseTimeoutRef.current = setTimeout(() => {
          const networkCanvas = (window as any).__networkCanvasRef;
          if (networkCanvas?.current && era.connectedNodeIds && era.connectedNodeIds.length > 0) {
            const firstNodeId = era.connectedNodeIds[0];
            networkCanvas.current.emitPulse(firstNodeId, "concept");
          }
        }, 200);
      }
    },
    [setHighlightNodeIds]
  );

  const handleEraHoverEnd = useCallback(() => {
    // Clear pulse timeout if still pending
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = null;
    }
    
    // Don't clear immediately - let it fade naturally
    setTimeout(() => {
      clearHighlightNodeIds();
    }, 300);
  }, [clearHighlightNodeIds]);

  return (
    <section
      id="experience"
      className="relative min-h-[100vh] flex items-center justify-center py-20"
    >
      <div className="container mx-auto px-4">
        {/* Section title */}
        <motion.h2
          className="h2-section text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: reducedMotion ? 0.3 : 0.6 }}
        >
          Experience
        </motion.h2>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto space-y-8">
          {experienceEras.map((era, index) => (
            <ExperienceEraCard
              key={era.id}
              era={era}
              index={index}
              onHover={handleEraHover}
              onHoverEnd={handleEraHoverEnd}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ExperienceEraCardProps {
  era: ExperienceEra;
  index: number;
  onHover: (era: ExperienceEra) => void;
  onHoverEnd: () => void;
  reducedMotion: boolean | null;
}

function ExperienceEraCard({
  era,
  index,
  onHover,
  onHoverEnd,
  reducedMotion,
}: ExperienceEraCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: reducedMotion ? 0.3 : 0.5,
        delay: reducedMotion ? 0 : index * 0.1,
      }}
      onMouseEnter={() => onHover(era)}
      onMouseLeave={onHoverEnd}
      className="group relative pb-8 border-b border-[var(--color-hairline)] 
                 hover:border-[var(--color-text-primary)] transition-colors duration-300
                 last:border-0"
    >
      {/* Era band */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        {/* Left: Role + Org + Dates */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-baseline md:gap-3 mb-2">
            <h3 className="h2-section text-lg font-garamond">
              {era.role}
            </h3>
            <span className="body-muted text-sm">{era.org}</span>
          </div>
          <p className="ui-label text-xs text-[var(--color-text-muted)]">
            {era.startDate} — {era.endDate}
          </p>
        </div>

        {/* Right: Impact chips */}
        <div className="flex flex-wrap gap-2 md:justify-end">
          {era.impactChips.map((chip, i) => (
            <div
              key={i}
              className="px-3 py-1 border border-[var(--color-hairline)] 
                       bg-[rgba(11,13,16,0.4)] backdrop-blur-sm"
            >
              <span className="body-muted text-xs">
                {chip.label}
                {chip.value && (
                  <span className="text-[var(--color-accent)] ml-1">
                    {chip.value}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bullets */}
      <ul className="space-y-2 mb-4">
        {era.bullets.map((bullet, i) => (
          <li
            key={i}
            className="body-muted text-sm flex items-start 
                     before:content-['•'] before:mr-2 before:mt-1 before:text-[var(--color-text-muted)]"
          >
            {bullet}
          </li>
        ))}
      </ul>

      {/* Diffusion forward row */}
      <div className="mt-4 pt-4 border-t border-[var(--color-hairline)] opacity-60 
                      group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex flex-wrap gap-2">
          {era.carryForward.map((tag, i) => (
            <span
              key={i}
              className="body-muted text-xs px-2 py-0.5 
                       border border-[var(--color-hairline)] 
                       bg-[rgba(11,13,16,0.3)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
