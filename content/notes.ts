export interface FieldNote {
  id: string;
  title: string;
  abstract: string;
  content: string; // ~250-400 words
  diagramPlaceholder?: string; // Optional diagram description
}

export const fieldNotes: FieldNote[] = [
  {
    id: "llm-evaluation-metrics",
    title: "Evaluating LLM Systems: what metrics miss",
    abstract: "Standard benchmarks capture accuracy but miss the emergent behaviors that matter in production. What happens when we measure for propagation instead of precision?",
    content: `When we evaluate LLM systems, we typically reach for familiar metrics: accuracy, latency, token efficiency. These numbers tell us something, but they miss the deeper question: how does this system propagate through a real environment?

Consider an agentic system deployed in production. The accuracy metric might show 95% on a test set, but that doesn't tell us how the system behaves when it encounters novel inputs, how it fails gracefully, or how its outputs influence downstream decisions. The real evaluation happens in the diffusion of information through the system.

What we're really measuring—or should be measuring—is propagation quality. How does information flow? Where do bottlenecks form? What happens at the edges of the system's knowledge? These questions require different instrumentation: tracing information flow, measuring decision cascades, understanding failure modes not as errors but as boundary conditions.

The metrics that matter are often the ones we can't easily quantify: system coherence, graceful degradation, emergent coordination. These emerge from the interaction between components, not from isolated unit tests. They require us to think about systems as networks, not as isolated functions.

This isn't to say traditional metrics are useless—they're necessary but insufficient. We need both: the precision of traditional evaluation and the propagation-aware measurement that captures how systems actually behave in the wild.`,
    diagramPlaceholder: "Information flow diagram showing traditional metrics vs. propagation metrics",
  },
  {
    id: "privacy-mathematically-enforced",
    title: "Privacy that is mathematically enforced (CipherShield)",
    abstract: "Zero-knowledge proofs and homomorphic encryption aren't just cryptographic tools—they're a way to build systems where privacy is a structural property, not a policy.",
    content: `Most privacy systems rely on trust: we trust that data won't be misused, that access controls will be enforced, that policies will be followed. But trust is fragile. What if privacy could be mathematically guaranteed instead of promised?

CipherShield explores this idea through zero-knowledge proofs and homomorphic encryption. The core insight is simple: if you can prove something is true without revealing what that something is, you've created a system where privacy is enforced by mathematics, not by policy.

Consider a multi-party computation scenario. Traditionally, you'd need to trust a central coordinator not to peek at the data. With homomorphic encryption, the coordinator can perform computations on encrypted data without ever seeing the plaintext. The privacy guarantee comes from the cryptographic properties of the scheme, not from human trust.

Zero-knowledge proofs take this further. You can prove you have valid credentials, that a computation was performed correctly, or that data meets certain criteria—all without revealing the underlying data itself. The proof is the guarantee.

This isn't just a theoretical exercise. In practice, it means building systems where privacy failures are mathematically impossible, not just policy violations. The system architecture itself enforces privacy, making it a structural property rather than an add-on feature.

The challenge, of course, is performance. Cryptographic operations are expensive. But as we've seen with CipherShield, careful engineering can make these guarantees practical for real-world systems. The question isn't whether mathematically-enforced privacy is possible—it's how to make it fast enough to use.`,
    diagramPlaceholder: "Zero-knowledge proof flow diagram",
  },
  {
    id: "signals-under-constraints",
    title: "Signals under constraints: SonicSync + FPGA lessons",
    abstract: "Real-time signal processing teaches us about working within hard constraints: latency, power, memory. The solutions that emerge are often more elegant than unconstrained designs.",
    content: `Working with real-time signal processing—whether in SonicSync's underwater audio system or FPGA-based holographic displays—forces you to think differently about constraints. They're not limitations to work around; they're the design space itself.

In SonicSync, we had a hard latency requirement: less than 10ms from input to output. This isn't a nice-to-have; it's a physical constraint. Sound travels through water, and any delay beyond a certain threshold breaks the user experience. You can't optimize your way out of this—you have to design for it from the start.

The FPGA hologram project taught similar lessons. You have limited fabric, fixed memory bandwidth, and strict timing requirements. But these constraints force elegant solutions. You can't brute-force your way through; you have to find the minimal representation that captures what matters.

What emerges from working under these constraints is a different kind of elegance. It's not about adding features; it's about finding the minimal set of operations that achieve the goal. Every cycle matters. Every memory access is a trade-off. Every pipeline stage is a decision.

This constraint-driven design produces systems that are often more robust than their unconstrained counterparts. When you can't afford to be wasteful, you find the essential structure. When you can't buffer indefinitely, you design for streaming. When you can't assume infinite resources, you build for the actual environment.

The lesson extends beyond hardware. Whether you're building distributed systems, real-time applications, or resource-constrained devices, thinking in terms of hard constraints leads to better architectures. The constraints aren't obstacles—they're the design requirements that force you to find the elegant solution.`,
    diagramPlaceholder: "Signal processing pipeline diagram",
  },
];

