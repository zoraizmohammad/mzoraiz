export interface ProofAnchor {
  id: string;
  name: string;
  descriptor: string;
  year: string;
  context: string; // 2-3 lines for modal
  links?: {
    article?: string;
    certificate?: string;
    project?: string;
  };
  connectedNodeIds?: string[]; // Canvas node IDs to highlight on hover
}

export const proofAnchors: ProofAnchor[] = [
  {
    id: "amazon-future-engineer",
    name: "Amazon Future Engineer Scholar",
    descriptor: "Full-ride scholarship for computer science",
    year: "2024",
    context: "Selected from thousands of applicants for a full-ride scholarship program supporting underrepresented students in computer science. Recognizes academic excellence and commitment to advancing technology.",
    links: {
      certificate: "/proof/amazon-future-engineer",
    },
    connectedNodeIds: ["project-aws", "domain-agentic-ai"],
  },
  {
    id: "lockheed-martin-stem",
    name: "Lockheed Martin STEM Scholar",
    descriptor: "STEM excellence recognition",
    year: "2023",
    context: "Awarded for outstanding achievements in science, technology, engineering, and mathematics. Recognizes contributions to innovative projects and research in hardware and signals processing.",
    links: {
      certificate: "/proof/lockheed-martin-stem",
    },
    connectedNodeIds: ["domain-hardware-signals", "project-fpga"],
  },
  {
    id: "dominion-energy-equity",
    name: "Dominion Energy Educational Equity Scholar",
    descriptor: "Educational equity scholarship",
    year: "2023",
    context: "Selected for commitment to advancing educational equity in STEM fields. Supports continued research and development in privacy-preserving technologies and computational biology.",
    links: {
      certificate: "/proof/dominion-energy-equity",
    },
    connectedNodeIds: ["domain-privacy-crypto", "domain-comp-bio-ml"],
  },
  {
    id: "treehacks-ciphershield",
    name: "TreeHacks Winner",
    descriptor: "CipherShield — Best Privacy Tech",
    year: "2024",
    context: "Won TreeHacks hackathon with CipherShield, a cryptographic framework for secure multi-party computation. Recognized for innovative approach to privacy-preserving data processing using zero-knowledge proofs.",
    links: {
      project: "/projects/ciphershield",
      article: "/proof/treehacks-ciphershield",
    },
    connectedNodeIds: ["project-cipher", "domain-privacy-crypto"],
  },
  {
    id: "ieee-sonicsync",
    name: "IEEE Publication",
    descriptor: "SonicSync — Underwater Communication",
    year: "2024",
    context: "Published research on psychoacoustic models for underwater audio communication in IEEE conference proceedings. Presents novel signal processing techniques for enhanced diver communication systems.",
    links: {
      article: "/proof/ieee-sonicsync",
      project: "/projects/sonicsync",
    },
    connectedNodeIds: ["project-sonic", "domain-hardware-signals"],
  },
];

