export interface Project {
  id: string;
  title: string;
  oneLineThesis: string;
  whatItDoes: string;
  roles: string[];
  hardProblems: string[];
  results: string[];
  stack: string[];
  links: {
    github?: string;
    writeup?: string;
    demo?: string;
  };
  domainId: "agentic-ai" | "privacy-crypto" | "hardware-signals" | "comp-bio-ml";
}

export const projects: Project[] = [
  {
    id: "aws-benchmark",
    title: "AWS Benchmark Platform",
    oneLineThesis: "Agentic AI systems that autonomously evaluate and optimize cloud infrastructure performance.",
    whatItDoes: "A platform that uses LLM agents to automatically benchmark AWS services, analyze performance metrics, and generate optimization recommendations. The system orchestrates multiple agents that collaborate to test different service configurations and identify bottlenecks.",
    roles: [
      "Designed multi-agent architecture for distributed benchmarking",
      "Implemented LLM orchestration layer for autonomous test generation",
      "Built performance analysis pipeline with real-time metrics aggregation"
    ],
    hardProblems: [
      "Coordinating multiple agents without race conditions or resource conflicts",
      "Generating valid test configurations that respect AWS service limits",
      "Real-time aggregation of metrics from distributed agent executions"
    ],
    results: [
      "Reduced benchmark execution time by 40% through parallel agent coordination",
      "Identified 15+ optimization opportunities across 8 AWS services",
      "Achieved 95% test configuration validity rate through LLM-guided generation"
    ],
    stack: ["Python", "LangChain", "AWS SDK", "PostgreSQL", "React"],
    links: {
      github: "https://github.com/yourusername/aws-benchmark",
      writeup: "/projects/aws-benchmark",
    },
    domainId: "agentic-ai",
  },
  {
    id: "ciphershield",
    title: "CipherShield",
    oneLineThesis: "Privacy-preserving cryptographic protocols for secure multi-party computation.",
    whatItDoes: "A cryptographic framework implementing zero-knowledge proofs and homomorphic encryption for secure data processing. Enables multiple parties to compute over encrypted data without revealing individual inputs, with applications in healthcare and financial data analysis.",
    roles: [
      "Designed zero-knowledge proof protocols for data verification",
      "Implemented homomorphic encryption schemes for secure computation",
      "Built secure multi-party computation orchestration layer"
    ],
    hardProblems: [
      "Minimizing computational overhead while maintaining cryptographic guarantees",
      "Designing protocols that work across heterogeneous data sources",
      "Ensuring protocol correctness under adversarial threat models"
    ],
    results: [
      "Achieved 60% reduction in computation time compared to baseline ZKP implementations",
      "Successfully processed 1M+ encrypted records without data leakage",
      "Published protocol analysis in cryptographic security conference"
    ],
    stack: ["Rust", "Zokrates", "Ethereum", "TypeScript", "WebAssembly"],
    links: {
      github: "https://github.com/yourusername/ciphershield",
      writeup: "/projects/ciphershield",
      demo: "https://ciphershield.demo",
    },
    domainId: "privacy-crypto",
  },
  {
    id: "sonicsync",
    title: "SonicSync",
    oneLineThesis: "Wearable underwater psychoacoustic system for enhanced diver communication and safety.",
    whatItDoes: "A wearable device system that uses advanced signal processing to enable clear audio communication underwater. Implements psychoacoustic models to optimize sound transmission through water, with real-time noise cancellation and directional audio focusing.",
    roles: [
      "Developed psychoacoustic models for underwater sound propagation",
      "Designed real-time signal processing pipeline for noise cancellation",
      "Built wearable hardware interface with low-latency audio processing"
    ],
    hardProblems: [
      "Compensating for frequency-dependent attenuation in water",
      "Real-time processing with <10ms latency on resource-constrained hardware",
      "Adapting psychoacoustic models to individual diver hearing profiles"
    ],
    results: [
      "Achieved 85% improvement in speech intelligibility compared to standard underwater comms",
      "Reduced processing latency to 8ms on embedded hardware",
      "Deployed in 50+ diver training sessions with positive feedback"
    ],
    stack: ["C++", "DSP", "Embedded Systems", "Python", "MATLAB"],
    links: {
      github: "https://github.com/yourusername/sonicsync",
      writeup: "/projects/sonicsync",
    },
    domainId: "hardware-signals",
  },
  {
    id: "fpga-hologram",
    title: "FPGA-Hologram Display",
    oneLineThesis: "Real-time holographic display system using FPGA-accelerated computational holography.",
    whatItDoes: "A digital holographic display that generates 3D images in real-time using FPGA-accelerated computation. Implements wavefront reconstruction algorithms on FPGA fabric to achieve high frame rates, enabling interactive 3D visualization without glasses or tracking.",
    roles: [
      "Designed FPGA architecture for parallel hologram computation",
      "Implemented wavefront reconstruction algorithms optimized for hardware",
      "Built real-time rendering pipeline with 60fps target"
    ],
    hardProblems: [
      "Mapping complex wavefront calculations to FPGA fabric efficiently",
      "Achieving real-time performance for interactive 3D scenes",
      "Minimizing quantization errors in hologram generation"
    ],
    results: [
      "Achieved 60fps rendering for 512x512 hologram resolution",
      "Reduced computation time by 200x compared to CPU implementation",
      "Demonstrated interactive 3D object manipulation with <16ms latency"
    ],
    stack: ["Verilog", "Vivado", "C++", "OpenGL", "Python"],
    links: {
      github: "https://github.com/yourusername/fpga-hologram",
      writeup: "/projects/fpga-hologram",
      demo: "https://fpga-hologram.demo",
    },
    domainId: "hardware-signals",
  },
  {
    id: "ml-gene-editing",
    title: "ML Classifier for Gene Editing",
    oneLineThesis: "Machine learning system for differentiating CRISPR editing signatures in genomic data.",
    whatItDoes: "A deep learning classifier that identifies and differentiates between various CRISPR gene editing signatures in genomic sequencing data. Uses convolutional neural networks to detect subtle patterns in DNA sequences that indicate specific editing events, enabling precise characterization of gene editing outcomes.",
    roles: [
      "Designed CNN architecture for sequence pattern recognition",
      "Developed data augmentation strategies for limited training data",
      "Built evaluation pipeline for editing signature classification"
    ],
    hardProblems: [
      "Distinguishing between similar editing signatures with high accuracy",
      "Handling class imbalance in training data (rare editing events)",
      "Generalizing to novel editing patterns not seen in training"
    ],
    results: [
      "Achieved 94% accuracy in differentiating 8 distinct editing signatures",
      "Reduced false positive rate to <2% for off-target detection",
      "Published findings in computational biology journal"
    ],
    stack: ["Python", "PyTorch", "BioPython", "NumPy", "scikit-learn"],
    links: {
      github: "https://github.com/yourusername/ml-gene-editing",
      writeup: "/projects/ml-gene-editing",
    },
    domainId: "comp-bio-ml",
  },
];

// Map project IDs to canvas node IDs
export const projectNodeIdMap: Record<string, string> = {
  "aws-benchmark": "project-aws",
  "ciphershield": "project-cipher",
  "sonicsync": "project-sonic",
  "fpga-hologram": "project-fpga",
  "ml-gene-editing": "project-ml",
};

