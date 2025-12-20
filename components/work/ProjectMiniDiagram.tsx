"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/content/projects";

interface ProjectMiniDiagramProps {
  project: Project;
}

export default function ProjectMiniDiagram({ project }: ProjectMiniDiagramProps) {
  const reducedMotion = useReducedMotion();
  
  // Layout constants - compact, instrument readout style
  const nodeRadius = 3;
  const nodeSpacing = 20;
  const columnSpacing = 50;
  const startX = 10;
  const startY = 15;
  
  // Calculate positions for each column
  const inputNodes = project.inputs.map((input, i) => ({
    label: input,
    x: startX,
    y: startY + i * nodeSpacing,
    index: i,
  }));
  
  const transformNodes = project.transforms.map((transform, i) => ({
    label: transform,
    x: startX + columnSpacing,
    y: startY + i * nodeSpacing,
    index: i,
  }));
  
  const outputNodes = project.outputs.map((output, i) => ({
    label: output,
    x: startX + columnSpacing * 2,
    y: startY + i * nodeSpacing,
    index: i,
  }));
  
  // Calculate SVG dimensions - compact
  const maxNodes = Math.max(inputNodes.length, transformNodes.length, outputNodes.length);
  const svgHeight = startY * 2 + maxNodes * nodeSpacing;
  const svgWidth = startX * 2 + columnSpacing * 2 + 120; // Extra width for labels
  
  // Generate connection paths (input → transform → output)
  const connections: Array<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    key: string;
  }> = [];
  
  // Connect inputs to transforms (many-to-many, but simplified)
  inputNodes.forEach((inputNode, i) => {
    const transformNode = transformNodes[Math.min(i, transformNodes.length - 1)];
    if (transformNode) {
      connections.push({
        from: { x: inputNode.x + nodeRadius, y: inputNode.y },
        to: { x: transformNode.x - nodeRadius, y: transformNode.y },
        key: `input-${i}-transform`,
      });
    }
  });
  
  // Connect transforms to outputs
  transformNodes.forEach((transformNode, i) => {
    const outputNode = outputNodes[Math.min(i, outputNodes.length - 1)];
    if (outputNode) {
      connections.push({
        from: { x: transformNode.x + nodeRadius, y: transformNode.y },
        to: { x: outputNode.x - nodeRadius, y: outputNode.y },
        key: `transform-${i}-output`,
      });
    }
  });
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.05,
        delayChildren: reducedMotion ? 0 : 0.1,
      },
    },
  };
  
  const nodeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: reducedMotion ? 0.2 : 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
  
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: reducedMotion ? 0.2 : 0.6, ease: "easeInOut" },
        opacity: { duration: 0.2 },
      },
    },
  };
  
  return (
    <motion.div
      key={project.id} // Key ensures re-animation on project change
      className="mt-8 pt-8 border-t border-[var(--color-hairline)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="ui-label mb-3 text-xs">System Flow</h3>
      <div className="relative">
        <svg
          width={svgWidth}
          height={svgHeight}
          className="overflow-visible"
          style={{ minHeight: svgHeight }}
        >
          {/* Connection lines */}
          <motion.g
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {connections.map((conn) => {
              const path = `M ${conn.from.x} ${conn.from.y} L ${conn.to.x} ${conn.to.y}`;
              return (
                <motion.path
                  key={conn.key}
                  d={path}
                  stroke="var(--color-hairline)"
                  strokeWidth="0.5"
                  fill="none"
                  variants={pathVariants}
                />
              );
            })}
          </motion.g>
          
          {/* Input nodes */}
          <motion.g
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {inputNodes.map((node) => (
              <motion.g key={`input-${node.index}`} variants={nodeVariants}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill="rgba(230, 228, 223, 0.2)"
                  stroke="var(--color-hairline)"
                  strokeWidth="0.5"
                />
                <text
                  x={node.x + nodeRadius + 5}
                  y={node.y + 3.5}
                  fontSize="9"
                  fill="var(--color-text-muted)"
                  fontFamily="var(--font-optima)"
                  className="select-none"
                >
                  {node.label}
                </text>
              </motion.g>
            ))}
          </motion.g>
          
          {/* Transform nodes */}
          <motion.g
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {transformNodes.map((node) => (
              <motion.g key={`transform-${node.index}`} variants={nodeVariants}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill="rgba(230, 228, 223, 0.2)"
                  stroke="var(--color-hairline)"
                  strokeWidth="0.5"
                />
                <text
                  x={node.x + nodeRadius + 5}
                  y={node.y + 3.5}
                  fontSize="9"
                  fill="var(--color-text-muted)"
                  fontFamily="var(--font-optima)"
                  className="select-none"
                >
                  {node.label}
                </text>
              </motion.g>
            ))}
          </motion.g>
          
          {/* Output nodes */}
          <motion.g
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {outputNodes.map((node) => (
              <motion.g key={`output-${node.index}`} variants={nodeVariants}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill="rgba(230, 228, 223, 0.2)"
                  stroke="var(--color-hairline)"
                  strokeWidth="0.5"
                />
                <text
                  x={node.x + nodeRadius + 5}
                  y={node.y + 3.5}
                  fontSize="9"
                  fill="var(--color-text-muted)"
                  fontFamily="var(--font-optima)"
                  className="select-none"
                >
                  {node.label}
                </text>
              </motion.g>
            ))}
          </motion.g>
        </svg>
      </div>
    </motion.div>
  );
}

