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
    // Cluster 1
    {
      id: "domain-cluster-1-center",
      label: "Domain Cluster 1",
      type: "domain",
      nx: 0.25,
      ny: 0.3,
      radius: 4,
      mass: 1.5,
    },
    {
      id: "domain-cluster-1-1",
      label: "D1.1",
      type: "domain",
      nx: 0.2,
      ny: 0.25,
    },
    {
      id: "domain-cluster-1-2",
      label: "D1.2",
      type: "domain",
      nx: 0.3,
      ny: 0.25,
    },
    {
      id: "domain-cluster-1-3",
      label: "D1.3",
      type: "domain",
      nx: 0.25,
      ny: 0.35,
    },
    // Cluster 2
    {
      id: "domain-cluster-2-center",
      label: "Domain Cluster 2",
      type: "domain",
      nx: 0.75,
      ny: 0.3,
      radius: 4,
      mass: 1.5,
    },
    {
      id: "domain-cluster-2-1",
      label: "D2.1",
      type: "domain",
      nx: 0.7,
      ny: 0.25,
    },
    {
      id: "domain-cluster-2-2",
      label: "D2.2",
      type: "domain",
      nx: 0.8,
      ny: 0.25,
    },
    {
      id: "domain-cluster-2-3",
      label: "D2.3",
      type: "domain",
      nx: 0.75,
      ny: 0.35,
    },
    // Cluster 3
    {
      id: "domain-cluster-3-center",
      label: "Domain Cluster 3",
      type: "domain",
      nx: 0.5,
      ny: 0.7,
      radius: 4,
      mass: 1.5,
    },
    {
      id: "domain-cluster-3-1",
      label: "D3.1",
      type: "domain",
      nx: 0.45,
      ny: 0.65,
    },
    {
      id: "domain-cluster-3-2",
      label: "D3.2",
      type: "domain",
      nx: 0.55,
      ny: 0.65,
    },
    {
      id: "domain-cluster-3-3",
      label: "D3.3",
      type: "domain",
      nx: 0.5,
      ny: 0.75,
    },
  ],
  edges: [
    // Cluster 1 edges
    { id: "dc1-e1", from: "domain-cluster-1-center", to: "domain-cluster-1-1" },
    { id: "dc1-e2", from: "domain-cluster-1-center", to: "domain-cluster-1-2" },
    { id: "dc1-e3", from: "domain-cluster-1-center", to: "domain-cluster-1-3" },
    { id: "dc1-e4", from: "domain-cluster-1-1", to: "domain-cluster-1-2" },
    // Cluster 2 edges
    { id: "dc2-e1", from: "domain-cluster-2-center", to: "domain-cluster-2-1" },
    { id: "dc2-e2", from: "domain-cluster-2-center", to: "domain-cluster-2-2" },
    { id: "dc2-e3", from: "domain-cluster-2-center", to: "domain-cluster-2-3" },
    { id: "dc2-e4", from: "domain-cluster-2-1", to: "domain-cluster-2-2" },
    // Cluster 3 edges
    { id: "dc3-e1", from: "domain-cluster-3-center", to: "domain-cluster-3-1" },
    { id: "dc3-e2", from: "domain-cluster-3-center", to: "domain-cluster-3-2" },
    { id: "dc3-e3", from: "domain-cluster-3-center", to: "domain-cluster-3-3" },
    { id: "dc3-e4", from: "domain-cluster-3-1", to: "domain-cluster-3-2" },
    // Inter-cluster connections
    { id: "inter-1", from: "domain-cluster-1-center", to: "domain-cluster-2-center" },
    { id: "inter-2", from: "domain-cluster-2-center", to: "domain-cluster-3-center" },
    { id: "inter-3", from: "domain-cluster-3-center", to: "domain-cluster-1-center" },
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

