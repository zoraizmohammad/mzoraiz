export interface ExperienceEra {
  id: string;
  role: string;
  org: string;
  startDate: string;
  endDate: string;
  impactChips: Array<{
    label: string;
    value?: string | number; // Optional number/metric
  }>;
  bullets: string[];
  carryForward: string[]; // Diffusion forward tags
  connectedNodeIds?: string[]; // Canvas node IDs to highlight on hover
}

export const experienceEras: ExperienceEra[] = [
  {
    id: "aws-ml-2025",
    role: "ML Engineering Intern",
    org: "AWS",
    startDate: "2025",
    endDate: "Present",
    impactChips: [
      { label: "Benchmark Systems", value: "8 services" },
      { label: "Performance Gains", value: "40%" },
      { label: "Test Validity", value: "95%" },
    ],
    bullets: [
      "Built agentic AI systems for autonomous cloud infrastructure evaluation",
      "Designed multi-agent orchestration layer reducing execution time by 40%",
      "Implemented LLM-guided test generation achieving 95% configuration validity",
    ],
    carryForward: [
      "distributed systems → eval pipelines",
      "agentic AI → autonomous testing",
      "performance optimization → cloud infrastructure",
    ],
    connectedNodeIds: ["project-aws", "domain-agentic-ai"],
  },
  {
    id: "aws-swe-2024",
    role: "Software Engineering Intern",
    org: "AWS",
    startDate: "2024",
    endDate: "2024",
    impactChips: [
      { label: "Services Shipped", value: "3" },
      { label: "Code Reviews", value: "150+" },
      { label: "Team Impact", value: "High" },
    ],
    bullets: [
      "Developed distributed systems components for AWS core services",
      "Collaborated on large-scale codebases with focus on reliability and performance",
      "Contributed to production systems serving millions of requests daily",
    ],
    carryForward: [
      "distributed systems → scalability patterns",
      "reliability engineering → production systems",
      "code quality → team velocity",
    ],
    connectedNodeIds: ["project-aws", "domain-agentic-ai"],
  },
  {
    id: "rockwell-2022-2023",
    role: "Embedded + Verification",
    org: "Rockwell Automation",
    startDate: "2022",
    endDate: "2023",
    impactChips: [
      { label: "Firmware Projects", value: "5+" },
      { label: "Test Coverage", value: "90%+" },
      { label: "CI/CD Pipeline", value: "Established" },
    ],
    bullets: [
      "Developed embedded firmware for industrial automation systems",
      "Built comprehensive verification framework improving test coverage to 90%+",
      "Established CI/CD pipeline reducing deployment time by 60%",
    ],
    carryForward: [
      "firmware CI → reliability",
      "embedded systems → hardware integration",
      "verification → quality assurance",
    ],
    connectedNodeIds: ["project-fpga", "domain-hardware-signals"],
  },
  {
    id: "mit-lincoln-2023",
    role: "Quantum Research",
    org: "MIT Lincoln Laboratory",
    startDate: "2023",
    endDate: "2023",
    impactChips: [
      { label: "Research Papers", value: "2" },
      { label: "Quantum Circuits", value: "50+" },
      { label: "Error Reduction", value: "30%" },
    ],
    bullets: [
      "Researched quantum computing algorithms and error correction methods",
      "Designed quantum circuits for specific computational problems",
      "Contributed to publications on quantum error mitigation techniques",
    ],
    carryForward: [
      "quantum algorithms → computational models",
      "error correction → reliability patterns",
      "research methodology → problem solving",
    ],
    connectedNodeIds: ["domain-hardware-signals", "domain-comp-bio-ml"],
  },
];

