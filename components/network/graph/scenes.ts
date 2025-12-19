import type { NormalizedScene } from "./types";

export const heroScene: NormalizedScene = {
  id: "hero",
  nodes: [
    {
      id: "you",
      label: "You",
      type: "you",
      nx: 0.5,
      ny: 0.5,
      radius: 5,
      mass: 2,
      fixed: true,
    },
    {
      id: "domain-1",
      label: "Domain 1",
      type: "domain",
      nx: 0.3,
      ny: 0.3,
    },
    {
      id: "domain-2",
      label: "Domain 2",
      type: "domain",
      nx: 0.7,
      ny: 0.3,
    },
    {
      id: "domain-3",
      label: "Domain 3",
      type: "domain",
      nx: 0.3,
      ny: 0.7,
    },
    {
      id: "domain-4",
      label: "Domain 4",
      type: "domain",
      nx: 0.7,
      ny: 0.7,
    },
  ],
  edges: [
    { id: "e1", from: "you", to: "domain-1" },
    { id: "e2", from: "you", to: "domain-2" },
    { id: "e3", from: "you", to: "domain-3" },
    { id: "e4", from: "you", to: "domain-4" },
  ],
  onEnterPulses: [
    {
      originNodeId: "you",
      toNodeType: "domain",
    },
  ],
  defaults: {
    nodeRadius: 3,
    nodeMass: 1,
    edgeWeight: 1,
  },
};

export const domainsScene: NormalizedScene = {
  id: "domains",
  nodes: [
    // Cluster 1: Agentic AI Systems
    {
      id: "domain-agentic-ai",
      label: "Agentic AI Systems",
      type: "domain",
      nx: 0.25,
      ny: 0.3,
      radius: 4,
      mass: 1.5,
    },
    {
      id: "domain-agentic-ai-1",
      label: "LLM Agents",
      type: "concept",
      nx: 0.2,
      ny: 0.25,
    },
    {
      id: "domain-agentic-ai-2",
      label: "Multi-Agent Systems",
      type: "concept",
      nx: 0.3,
      ny: 0.25,
    },
    {
      id: "domain-agentic-ai-3",
      label: "Reinforcement Learning",
      type: "concept",
      nx: 0.25,
      ny: 0.35,
    },
    // Cluster 2: Privacy & Cryptography
    {
      id: "domain-privacy-crypto",
      label: "Privacy & Cryptography",
      type: "domain",
      nx: 0.75,
      ny: 0.3,
      radius: 4,
      mass: 1.5,
    },
    {
      id: "domain-privacy-crypto-1",
      label: "Zero-Knowledge Proofs",
      type: "concept",
      nx: 0.7,
      ny: 0.25,
    },
    {
      id: "domain-privacy-crypto-2",
      label: "Homomorphic Encryption",
      type: "concept",
      nx: 0.8,
      ny: 0.25,
    },
    {
      id: "domain-privacy-crypto-3",
      label: "Secure Multi-Party",
      type: "concept",
      nx: 0.75,
      ny: 0.35,
    },
    // Cluster 3: Hardware & Signals
    {
      id: "domain-hardware-signals",
      label: "Hardware & Signals",
      type: "domain",
      nx: 0.2,
      ny: 0.7,
      radius: 4,
      mass: 1.5,
    },
    {
      id: "domain-hardware-signals-1",
      label: "FPGA Design",
      type: "concept",
      nx: 0.15,
      ny: 0.65,
    },
    {
      id: "domain-hardware-signals-2",
      label: "Signal Processing",
      type: "concept",
      nx: 0.25,
      ny: 0.65,
    },
    {
      id: "domain-hardware-signals-3",
      label: "Quantum Computing",
      type: "concept",
      nx: 0.2,
      ny: 0.75,
    },
    // Cluster 4: Computational Bio / ML (Gene Editing)
    {
      id: "domain-comp-bio-ml",
      label: "Computational Bio / ML",
      type: "domain",
      nx: 0.75,
      ny: 0.7,
      radius: 4,
      mass: 1.5,
    },
    {
      id: "domain-comp-bio-ml-1",
      label: "CRISPR Design",
      type: "concept",
      nx: 0.7,
      ny: 0.65,
    },
    {
      id: "domain-comp-bio-ml-2",
      label: "Genomic ML",
      type: "concept",
      nx: 0.8,
      ny: 0.65,
    },
    {
      id: "domain-comp-bio-ml-3",
      label: "Protein Folding",
      type: "concept",
      nx: 0.75,
      ny: 0.75,
    },
  ],
  edges: [
    // Cluster 1: Agentic AI edges
    { id: "dc1-e1", from: "domain-agentic-ai", to: "domain-agentic-ai-1" },
    { id: "dc1-e2", from: "domain-agentic-ai", to: "domain-agentic-ai-2" },
    { id: "dc1-e3", from: "domain-agentic-ai", to: "domain-agentic-ai-3" },
    { id: "dc1-e4", from: "domain-agentic-ai-1", to: "domain-agentic-ai-2" },
    // Cluster 2: Privacy & Crypto edges
    { id: "dc2-e1", from: "domain-privacy-crypto", to: "domain-privacy-crypto-1" },
    { id: "dc2-e2", from: "domain-privacy-crypto", to: "domain-privacy-crypto-2" },
    { id: "dc2-e3", from: "domain-privacy-crypto", to: "domain-privacy-crypto-3" },
    { id: "dc2-e4", from: "domain-privacy-crypto-1", to: "domain-privacy-crypto-2" },
    // Cluster 3: Hardware & Signals edges
    { id: "dc3-e1", from: "domain-hardware-signals", to: "domain-hardware-signals-1" },
    { id: "dc3-e2", from: "domain-hardware-signals", to: "domain-hardware-signals-2" },
    { id: "dc3-e3", from: "domain-hardware-signals", to: "domain-hardware-signals-3" },
    { id: "dc3-e4", from: "domain-hardware-signals-1", to: "domain-hardware-signals-2" },
    // Cluster 4: Computational Bio / ML edges
    { id: "dc4-e1", from: "domain-comp-bio-ml", to: "domain-comp-bio-ml-1" },
    { id: "dc4-e2", from: "domain-comp-bio-ml", to: "domain-comp-bio-ml-2" },
    { id: "dc4-e3", from: "domain-comp-bio-ml", to: "domain-comp-bio-ml-3" },
    { id: "dc4-e4", from: "domain-comp-bio-ml-1", to: "domain-comp-bio-ml-2" },
    // Inter-cluster connections
    { id: "inter-1", from: "domain-agentic-ai", to: "domain-privacy-crypto" },
    { id: "inter-2", from: "domain-privacy-crypto", to: "domain-comp-bio-ml" },
    { id: "inter-3", from: "domain-comp-bio-ml", to: "domain-hardware-signals" },
    { id: "inter-4", from: "domain-hardware-signals", to: "domain-agentic-ai" },
  ],
  defaults: {
    nodeRadius: 3,
    nodeMass: 1,
    edgeWeight: 1,
  },
};

export const projectsScene: NormalizedScene = {
  id: "projects",
  nodes: [
    {
      id: "project-aws",
      label: "AWS Benchmark",
      type: "project",
      nx: 0.2,
      ny: 0.3,
      radius: 4,
      mass: 1.5,
    },
    {
      id: "project-cipher",
      label: "CipherShield",
      type: "project",
      nx: 0.8,
      ny: 0.3,
      radius: 4,
      mass: 1.5,
    },
    {
      id: "project-sonic",
      label: "SonicSync",
      type: "project",
      nx: 0.2,
      ny: 0.7,
      radius: 4,
      mass: 1.5,
    },
    {
      id: "project-fpga",
      label: "FPGA Hologram",
      type: "project",
      nx: 0.8,
      ny: 0.7,
      radius: 4,
      mass: 1.5,
    },
    {
      id: "project-ml",
      label: "ML Classifier",
      type: "project",
      nx: 0.5,
      ny: 0.5,
      radius: 4,
      mass: 1.5,
    },
    // Supporting nodes for each project
    {
      id: "project-aws-1",
      label: "AWS-1",
      type: "concept",
      nx: 0.15,
      ny: 0.25,
    },
    {
      id: "project-aws-2",
      label: "AWS-2",
      type: "concept",
      nx: 0.25,
      ny: 0.25,
    },
    {
      id: "project-cipher-1",
      label: "Cipher-1",
      type: "concept",
      nx: 0.75,
      ny: 0.25,
    },
    {
      id: "project-cipher-2",
      label: "Cipher-2",
      type: "concept",
      nx: 0.85,
      ny: 0.25,
    },
    {
      id: "project-sonic-1",
      label: "Sonic-1",
      type: "concept",
      nx: 0.15,
      ny: 0.65,
    },
    {
      id: "project-sonic-2",
      label: "Sonic-2",
      type: "concept",
      nx: 0.25,
      ny: 0.65,
    },
    {
      id: "project-fpga-1",
      label: "FPGA-1",
      type: "concept",
      nx: 0.75,
      ny: 0.65,
    },
    {
      id: "project-fpga-2",
      label: "FPGA-2",
      type: "concept",
      nx: 0.85,
      ny: 0.65,
    },
    {
      id: "project-ml-1",
      label: "ML-1",
      type: "concept",
      nx: 0.45,
      ny: 0.45,
    },
    {
      id: "project-ml-2",
      label: "ML-2",
      type: "concept",
      nx: 0.55,
      ny: 0.45,
    },
    {
      id: "project-ml-3",
      label: "ML-3",
      type: "concept",
      nx: 0.45,
      ny: 0.55,
    },
    {
      id: "project-ml-4",
      label: "ML-4",
      type: "concept",
      nx: 0.55,
      ny: 0.55,
    },
  ],
  edges: [
    // AWS Benchmark connections
    { id: "aws-e1", from: "project-aws", to: "project-aws-1" },
    { id: "aws-e2", from: "project-aws", to: "project-aws-2" },
    { id: "aws-e3", from: "project-aws-1", to: "project-aws-2" },
    // CipherShield connections
    { id: "cipher-e1", from: "project-cipher", to: "project-cipher-1" },
    { id: "cipher-e2", from: "project-cipher", to: "project-cipher-2" },
    { id: "cipher-e3", from: "project-cipher-1", to: "project-cipher-2" },
    // SonicSync connections
    { id: "sonic-e1", from: "project-sonic", to: "project-sonic-1" },
    { id: "sonic-e2", from: "project-sonic", to: "project-sonic-2" },
    { id: "sonic-e3", from: "project-sonic-1", to: "project-sonic-2" },
    // FPGA Hologram connections
    { id: "fpga-e1", from: "project-fpga", to: "project-fpga-1" },
    { id: "fpga-e2", from: "project-fpga", to: "project-fpga-2" },
    { id: "fpga-e3", from: "project-fpga-1", to: "project-fpga-2" },
    // ML Classifier connections
    { id: "ml-e1", from: "project-ml", to: "project-ml-1" },
    { id: "ml-e2", from: "project-ml", to: "project-ml-2" },
    { id: "ml-e3", from: "project-ml", to: "project-ml-3" },
    { id: "ml-e4", from: "project-ml", to: "project-ml-4" },
    { id: "ml-e5", from: "project-ml-1", to: "project-ml-2" },
    { id: "ml-e6", from: "project-ml-3", to: "project-ml-4" },
    // Inter-project connections
    { id: "inter-p1", from: "project-aws", to: "project-ml" },
    { id: "inter-p2", from: "project-cipher", to: "project-ml" },
    { id: "inter-p3", from: "project-sonic", to: "project-ml" },
    { id: "inter-p4", from: "project-fpga", to: "project-ml" },
  ],
  defaults: {
    nodeRadius: 3,
    nodeMass: 1,
    edgeWeight: 1,
  },
};

// Export all scenes
export const scenes = {
  hero: heroScene,
  domains: domainsScene,
  projects: projectsScene,
};

