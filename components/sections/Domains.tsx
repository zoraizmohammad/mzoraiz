"use client";

import { useCallback, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSceneStore, type DomainId } from "@/store/sceneStore";

interface Domain {
  id: DomainId;
  name: string;
  nodeId: string; // Canvas node ID
  bullets: string[];
  connectedProjectIds?: string[]; // Project node IDs connected to this domain
}

const domains: Domain[] = [
  {
    id: "agentic-ai",
    name: "Agentic AI Systems",
    nodeId: "domain-agentic-ai",
    bullets: ["LLM Agents", "Multi-Agent Systems", "Reinforcement Learning"],
    connectedProjectIds: ["project-aws", "project-ml"], // Example connections
  },
  {
    id: "privacy-crypto",
    name: "Privacy & Cryptography",
    nodeId: "domain-privacy-crypto",
    bullets: ["Zero-Knowledge Proofs", "Homomorphic Encryption", "Secure Multi-Party"],
    connectedProjectIds: ["project-cipher"],
  },
  {
    id: "hardware-signals",
    name: "Hardware & Signals",
    nodeId: "domain-hardware-signals",
    bullets: ["FPGA Design", "Signal Processing", "Quantum Computing"],
    connectedProjectIds: ["project-fpga", "project-sonic"],
  },
  {
    id: "comp-bio-ml",
    name: "Computational Bio / ML",
    nodeId: "domain-comp-bio-ml",
    bullets: ["CRISPR Design", "Genomic ML", "Protein Folding"],
    connectedProjectIds: ["project-ml"],
  },
];

// Helper to get concept node IDs for a domain
function getConceptNodeIds(domainNodeId: string): string[] {
  return [
    `${domainNodeId}-1`,
    `${domainNodeId}-2`,
    `${domainNodeId}-3`,
  ];
}

export default function Domains() {
  const reducedMotion = useReducedMotion();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    setActiveDomain,
    setHighlightNodeIds,
    clearHighlightNodeIds,
  } = useSceneStore();

  const handleHover = useCallback(
    (domain: Domain) => {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }

      if (reducedMotion) {
        // Reduced motion: just highlight, no pulse
        const conceptNodeIds = getConceptNodeIds(domain.nodeId);
        const highlightIds = [
          domain.nodeId,
          ...conceptNodeIds,
          ...(domain.connectedProjectIds || []),
        ];
        setHighlightNodeIds(highlightIds);
        return;
      }

      // Normal motion: emit pulse and highlight
      const networkCanvas = (window as any).__networkCanvasRef;
      if (networkCanvas?.current) {
        // Emit pulse from domain node to its concept nodes
        networkCanvas.current.emitPulse(domain.nodeId, "concept");
      }

      // Highlight domain node, concept nodes, and connected projects
      const conceptNodeIds = getConceptNodeIds(domain.nodeId);
      const highlightIds = [
        domain.nodeId,
        ...conceptNodeIds,
        ...(domain.connectedProjectIds || []),
      ];
      setHighlightNodeIds(highlightIds);

      // Clear highlight after a delay
      hoverTimeoutRef.current = setTimeout(() => {
        clearHighlightNodeIds();
      }, 3000);
    },
    [reducedMotion, setHighlightNodeIds, clearHighlightNodeIds]
  );

  const handleHoverEnd = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    // Don't clear immediately - let it fade naturally
    setTimeout(() => {
      clearHighlightNodeIds();
    }, 500);
  }, [clearHighlightNodeIds]);

  const handleClick = useCallback(
    (domain: Domain) => {
      // Set active domain filter
      setActiveDomain(domain.id);

      // Scroll to work section
      const workSection = document.getElementById("work");
      if (workSection) {
        const lenis = (window as any).lenis;
        if (lenis) {
          lenis.scrollTo(workSection, { offset: 0, duration: 1.5 });
        } else {
          workSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    [setActiveDomain]
  );

  return (
    <section
      id="domains"
      className="relative min-h-[100vh] flex items-center justify-center py-20"
    >
      <div className="container mx-auto px-4">
        {/* Section title */}
        <motion.h2
          className="h2-section text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: reducedMotion ? 0.3 : 0.6 }}
        >
          Domains
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="body-muted text-center mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: reducedMotion ? 0.3 : 0.6, delay: 0.1 }}
        >
          Systems that propagate through interconnected knowledge—each domain
          diffuses into projects, concepts, and applications.
        </motion.p>

        {/* Domain cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {domains.map((domain, index) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              index={index}
              onHover={handleHover}
              onHoverEnd={handleHoverEnd}
              onClick={handleClick}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface DomainCardProps {
  domain: Domain;
  index: number;
  onHover: (domain: Domain) => void;
  onHoverEnd: () => void;
  onClick: (domain: Domain) => void;
  reducedMotion: boolean | null;
}

function DomainCard({
  domain,
  index,
  onHover,
  onHoverEnd,
  onClick,
  reducedMotion,
}: DomainCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: reducedMotion ? 0.3 : 0.5,
        delay: reducedMotion ? 0 : index * 0.1,
      }}
      onMouseEnter={() => onHover(domain)}
      onMouseLeave={onHoverEnd}
      onClick={() => onClick(domain)}
      className="group relative cursor-pointer"
    >
      {/* Card container */}
      <div
        className="relative p-6 border border-[var(--color-hairline)] 
                   bg-[rgba(11,13,16,0.6)] backdrop-blur-sm
                   transition-all duration-300
                   hover:border-[var(--color-text-primary)] 
                   hover:bg-[rgba(11,13,16,0.8)]
                   focus-within:ring-2 focus-within:ring-[var(--color-accent)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--color-background)]
                   focus-within:outline-none"
        style={{
          // Subtle glass effect
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Reduced motion: simple underline on hover */}
        {reducedMotion && (
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)] 
                       transform scale-x-0 transition-transform duration-300
                       group-hover:scale-x-100"
          />
        )}

        {/* Domain name */}
        <h3 className="h2-section text-xl mb-4 group-hover:text-[var(--color-accent)] transition-colors duration-300">
          {domain.name}
        </h3>

        {/* Micro-bullets */}
        <ul className="space-y-2">
          {domain.bullets.map((bullet, i) => (
            <li
              key={i}
              className="body-muted text-sm flex items-center before:content-['•'] before:mr-2 before:text-[var(--color-text-muted)]"
            >
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
