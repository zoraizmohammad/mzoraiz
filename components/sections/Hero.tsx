"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function Hero() {
  const hasTriggeredPulseRef = useRef(false);
  const reducedMotion = useReducedMotion();

  // Trigger pulse when animation completes
  useEffect(() => {
    if (hasTriggeredPulseRef.current) return;

    // Wait for animation to complete (stagger duration + delay)
    const delay = reducedMotion ? 500 : 2000; // Shorter delay for reduced motion
    const timeoutId = setTimeout(() => {
      // Access network canvas via global ref
      const networkCanvas = (window as any).__networkCanvasRef;
      if (networkCanvas?.current) {
        networkCanvas.current.emitPulse("you", "domain");
        hasTriggeredPulseRef.current = true;
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [reducedMotion]);

  const handleViewWork = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const workSection = document.getElementById("work");
    if (workSection) {
      // Use Lenis if available, otherwise native scroll
      const lenis = (window as any).lenis;
      if (lenis) {
        lenis.scrollTo(workSection, { offset: 0, duration: 1.5 });
      } else {
        workSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleDownloadResume = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Placeholder: link to resume PDF
    window.open("/resume.pdf", "_blank");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.1,
        delayChildren: reducedMotion ? 0 : 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reducedMotion ? 0.3 : 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const headlineWords = "I build agentic systems, privacy tech, and learning platforms—designed to propagate.".split(
    " "
  );

  return (
    <section
      id="hero"
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden"
    >
      {/* Subtle spotlight background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(111, 168, 255, 0.03) 0%, transparent 70%)",
        }}
      />

      {/* Content container with proper z-index */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Main headline with word stagger */}
          <motion.h1
            className="h1-hero mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
            variants={itemVariants}
          >
            {reducedMotion ? (
              // Simple fade for reduced motion
              <span>{headlineWords.join(" ")}</span>
            ) : (
              // Word-by-word stagger
              headlineWords.map((word, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1],
                        delay: index * 0.05,
                      },
                    },
                  }}
                  className="inline-block mr-2"
                >
                  {word}
                </motion.span>
              ))
            )}
          </motion.h1>

          {/* Subline */}
          <motion.p
            className="body-muted text-lg mb-12 drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]"
            variants={itemVariants}
          >
            ECE / CS / Physics @ Duke • AWS ML Intern • MIT Lincoln Lab (QC)
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={itemVariants}
          >
            <Button
              variant="primary"
              onClick={handleViewWork}
              aria-label="View my work and projects"
            >
              View Work
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownloadResume}
              aria-label="Download my resume as PDF"
            >
              Download Resume
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
