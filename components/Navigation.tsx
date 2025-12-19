"use client";

const sections = [
  { id: "hero", label: "Hero" },
  { id: "domains", label: "Domains" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "proof", label: "Proof" },
  { id: "notes", label: "Notes" },
  { id: "contact", label: "Contact" },
];

export default function Navigation() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="pointer-events-auto">
          <a
            href="#hero"
            onClick={(e) => handleClick(e, "hero")}
            className="font-optima text-[var(--color-text-primary)] text-sm font-light tracking-wide"
          >
            Mohammad Zoraiz
          </a>
        </div>
        <div className="pointer-events-auto flex gap-6">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => handleClick(e, section.id)}
              className="ui-label hover:text-[var(--color-text-primary)] transition-colors"
            >
              {section.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

