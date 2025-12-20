"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { useSceneStore } from "@/store/sceneStore";

export default function Contact() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const hasTriggeredEffectsRef = useRef(false);

  // Trigger canvas effects when section enters view
  useEffect(() => {
    if (isInView && !hasTriggeredEffectsRef.current) {
      hasTriggeredEffectsRef.current = true;

      // Recenter canvas to "you" node and zoom out
      const networkCanvas = (window as any).__networkCanvasRef;
      if (networkCanvas?.current) {
        // Trigger final pulse: you → domains → projects → proof nodes
        setTimeout(() => {
          networkCanvas.current.emitPulse("you", "domain");
        }, 500);

        setTimeout(() => {
          networkCanvas.current.emitPulse("you", "project");
        }, 1200);

        // Note: Camera centering would need to be implemented in NetworkCanvas
        // For now, we'll just trigger the pulses
      }
    }
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-[100vh] flex items-center justify-center py-20"
    >
      <div className="container mx-auto px-4">
        {/* Main closing line */}
        <motion.h2
          className="h2-section text-center mb-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: reducedMotion ? 0.3 : 0.8 }}
        >
          Let's build something that propagates.
        </motion.h2>

        {/* Subtext */}
        <motion.p
          className="body-muted text-center mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: reducedMotion ? 0.3 : 0.8,
            delay: reducedMotion ? 0 : 0.2,
          }}
        >
          If you're building systems that need clarity, rigor, and motion—let's talk.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: reducedMotion ? 0.3 : 0.8,
            delay: reducedMotion ? 0 : 0.4,
          }}
        >
          <a
            href="mailto:mohammad.zoraiz@duke.edu"
            className="body px-6 py-3 border border-[var(--color-hairline)] 
                     bg-[rgba(11,13,16,0.3)] hover:border-[var(--color-accent)] 
                     hover:text-[var(--color-accent)] transition-colors
                     focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            Email
          </a>
          <a
            href="https://linkedin.com/in/mohammad-zoraiz"
            target="_blank"
            rel="noopener noreferrer"
            className="body px-6 py-3 border border-[var(--color-hairline)] 
                     bg-[rgba(11,13,16,0.3)] hover:border-[var(--color-accent)] 
                     hover:text-[var(--color-accent)] transition-colors
                     focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/mzoraiz"
            target="_blank"
            rel="noopener noreferrer"
            className="body px-6 py-3 border border-[var(--color-hairline)] 
                     bg-[rgba(11,13,16,0.3)] hover:border-[var(--color-accent)] 
                     hover:text-[var(--color-accent)] transition-colors
                     focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            GitHub
          </a>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0.3 : 0.8,
            delay: reducedMotion ? 0 : 0.6,
          }}
        >
          <p className="body-muted text-sm">
            © Mohammad Zoraiz • Built with Next.js
          </p>
        </motion.div>
      </div>
    </section>
  );
}
