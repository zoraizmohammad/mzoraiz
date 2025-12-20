"use client";

import { useState, useCallback } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef } from "react";
import { useSceneStore } from "@/store/sceneStore";
import { proofAnchors, type ProofAnchor } from "@/content/proof";
import Modal from "@/components/ui/Modal";

export default function Proof() {
  const reducedMotion = useReducedMotion();
  const { setHighlightNodeIds, clearHighlightNodeIds } = useSceneStore();
  const [selectedAnchor, setSelectedAnchor] = useState<ProofAnchor | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleAnchorHover = useCallback(
    (anchor: ProofAnchor) => {
      if (anchor.connectedNodeIds && anchor.connectedNodeIds.length > 0) {
        setHighlightNodeIds(anchor.connectedNodeIds);
        
        // Emit pulse from first connected node if available
        const networkCanvas = (window as any).__networkCanvasRef;
        if (networkCanvas?.current && anchor.connectedNodeIds.length > 0) {
          const firstNodeId = anchor.connectedNodeIds[0];
          networkCanvas.current.emitPulse(firstNodeId, "concept");
        }
      }
    },
    [setHighlightNodeIds]
  );

  const handleAnchorHoverEnd = useCallback(() => {
    // Don't clear immediately - let it fade naturally
    setTimeout(() => {
      clearHighlightNodeIds();
    }, 300);
  }, [clearHighlightNodeIds]);

  const handleAnchorClick = useCallback((anchor: ProofAnchor) => {
    setSelectedAnchor(anchor);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAnchor(null);
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="proof"
        className="relative min-h-[100vh] flex items-center justify-center py-20"
      >
        <div className="container mx-auto px-4">
          {/* Section title */}
          <motion.h2
            className="h2-section text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: reducedMotion ? 0.3 : 0.6 }}
          >
            Proof
          </motion.h2>

          {/* Anchors grid - right-aligned on desktop, two-column with whitespace */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-12 
                           md:justify-items-end md:pr-8">
              {proofAnchors.map((anchor, index) => (
                <ProofAnchorRow
                  key={anchor.id}
                  anchor={anchor}
                  index={index}
                  onHover={handleAnchorHover}
                  onHoverEnd={handleAnchorHoverEnd}
                  onClick={handleAnchorClick}
                  reducedMotion={reducedMotion}
                  isInView={isInView}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <Modal
        isOpen={selectedAnchor !== null}
        onClose={handleCloseModal}
        title={selectedAnchor?.name || ""}
      >
        {selectedAnchor && (
          <div className="space-y-6">
            <div>
              <p className="body-muted leading-relaxed">{selectedAnchor.context}</p>
            </div>

            {selectedAnchor.links && (
              <div className="pt-4 border-t border-[var(--color-hairline)]">
                <h3 className="ui-label mb-3 text-xs">Links</h3>
                <div className="flex flex-wrap gap-4">
                  {selectedAnchor.links.article && (
                    <a
                      href={selectedAnchor.links.article}
                      className="body text-[var(--color-text-secondary)] 
                               hover:text-[var(--color-accent)] transition-colors
                               focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                      Article
                    </a>
                  )}
                  {selectedAnchor.links.certificate && (
                    <a
                      href={selectedAnchor.links.certificate}
                      className="body text-[var(--color-text-secondary)] 
                               hover:text-[var(--color-accent)] transition-colors
                               focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                      Certificate
                    </a>
                  )}
                  {selectedAnchor.links.project && (
                    <a
                      href={selectedAnchor.links.project}
                      className="body text-[var(--color-text-secondary)] 
                               hover:text-[var(--color-accent)] transition-colors
                               focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                      Related Project
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

interface ProofAnchorRowProps {
  anchor: ProofAnchor;
  index: number;
  onHover: (anchor: ProofAnchor) => void;
  onHoverEnd: () => void;
  onClick: (anchor: ProofAnchor) => void;
  reducedMotion: boolean | null;
  isInView: boolean;
}

function ProofAnchorRow({
  anchor,
  index,
  onHover,
  onHoverEnd,
  onClick,
  reducedMotion,
  isInView,
}: ProofAnchorRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rowInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      animate={
        isInView && rowInView
          ? { opacity: 1, x: 0 }
          : { opacity: 0, x: index % 2 === 0 ? -20 : 20 }
      }
      transition={{
        duration: reducedMotion ? 0.3 : 0.5,
        delay: reducedMotion ? 0 : index * 0.1,
      }}
      onMouseEnter={() => onHover(anchor)}
      onMouseLeave={onHoverEnd}
      onClick={() => onClick(anchor)}
      className="group w-full md:w-auto md:text-right cursor-pointer
                 hover:text-[var(--color-accent)] transition-colors duration-300
                 border-b border-[var(--color-hairline)] md:border-0 pb-4 md:pb-0
                 hover:border-[var(--color-accent)] transition-colors"
    >
      <div className="flex flex-col md:items-end gap-1">
        <h3 className="body text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] 
                      transition-colors duration-300">
          {anchor.name}
        </h3>
        <p className="body-muted text-sm">{anchor.descriptor}</p>
        <p className="ui-label text-xs text-[var(--color-text-muted)] mt-1">
          {anchor.year}
        </p>
      </div>
    </motion.div>
  );
}
