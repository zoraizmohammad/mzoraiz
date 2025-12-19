"use client";

import { useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useSceneStore } from "@/store/sceneStore";
import { projects, projectNodeIdMap, type Project } from "@/content/projects";

export default function Projects() {
  const reducedMotion = useReducedMotion();
  const manualLockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    activeProjectId,
    hoverProjectId,
    setActiveProjectId,
    setHoverProjectId,
    setHighlightNodeIds,
    clearHighlightNodeIds,
    sceneProgress,
    currentSceneId,
  } = useSceneStore();

  // Set manual lock for 4 seconds when user clicks
  const setManualLock = useCallback(() => {
    // Clear existing timeout
    if (manualLockTimeoutRef.current) {
      clearTimeout(manualLockTimeoutRef.current);
    }
    
    // Set lock until 4 seconds from now
    const lockUntil = Date.now() + 4000;
    (window as any).__workManualLockUntil = lockUntil;
    
    // Clear lock after 4 seconds
    manualLockTimeoutRef.current = setTimeout(() => {
      (window as any).__workManualLockUntil = null;
      manualLockTimeoutRef.current = null;
    }, 4000);
  }, []);
  
  // Cleanup manual lock on unmount
  useEffect(() => {
    return () => {
      if (manualLockTimeoutRef.current) {
        clearTimeout(manualLockTimeoutRef.current);
      }
      delete (window as any).__workManualLockUntil;
    };
  }, []);

  // Initialize active project if none selected
  useEffect(() => {
    if (!activeProjectId && projects.length > 0) {
      setActiveProjectId(projects[0].id as any);
    }
  }, [activeProjectId, setActiveProjectId]);

  // Get active project
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0];
  }, [activeProjectId]);

  // Handle project hover
  const handleProjectHover = useCallback(
    (project: Project) => {
      setHoverProjectId(project.id as any);
      
      // Emit pulse from project hub
      const networkCanvas = (window as any).__networkCanvasRef;
      if (networkCanvas?.current) {
        const nodeId = projectNodeIdMap[project.id];
        if (nodeId) {
          networkCanvas.current.emitPulse(nodeId, "concept");
        }
      }
    },
    [setHoverProjectId]
  );

  // Handle project click
  const handleProjectClick = useCallback(
    (project: Project) => {
      // Set manual lock for 4 seconds
      setManualLock();
      
      setActiveProjectId(project.id as any);
      
      // Highlight project hub and its neighbors
      const nodeId = projectNodeIdMap[project.id];
      if (nodeId) {
        // Get concept nodes for this project based on actual scene structure
        const conceptNodeIds: string[] = [];
        
        // ML project has 4 concept nodes, others have 2
        if (nodeId === "project-ml") {
          conceptNodeIds.push("project-ml-1", "project-ml-2", "project-ml-3", "project-ml-4");
        } else {
          conceptNodeIds.push(`${nodeId}-1`, `${nodeId}-2`);
        }
        
        const highlightIds = [nodeId, ...conceptNodeIds];
        setHighlightNodeIds(highlightIds);
      }
    },
    [setActiveProjectId, setHighlightNodeIds, setManualLock]
  );

  // Update highlights when active project changes (without triggering click handler)
  useEffect(() => {
    if (activeProjectId) {
      const project = projects.find((p) => p.id === activeProjectId);
      if (project) {
        const nodeId = projectNodeIdMap[project.id];
        if (nodeId) {
          const conceptNodeIds: string[] = [];
          if (nodeId === "project-ml") {
            conceptNodeIds.push("project-ml-1", "project-ml-2", "project-ml-3", "project-ml-4");
          } else {
            conceptNodeIds.push(`${nodeId}-1`, `${nodeId}-2`);
          }
          const highlightIds = [nodeId, ...conceptNodeIds];
          setHighlightNodeIds(highlightIds);
        }
      }
    }
  }, [activeProjectId, setHighlightNodeIds]);

  // Clear hover on mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoverProjectId(null);
  }, [setHoverProjectId]);

  return (
    <section
      id="work"
      className="relative min-h-[100vh] flex items-center justify-center py-20"
    >
      <div className="container mx-auto px-4">
        {/* Section header */}
        <h2 className="h2-section text-center mb-16">Selected Work</h2>

        {/* Two-column layout: desktop */}
        <div className="hidden md:grid md:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left: Project index list */}
          <div className="space-y-1">
            {projects.map((project, index) => {
              const isActive = project.id === activeProjectId;
              const isHovered = project.id === hoverProjectId;
              
              return (
                <motion.button
                  key={project.id}
                  onClick={() => handleProjectClick(project)}
                  onMouseEnter={() => handleProjectHover(project)}
                  onMouseLeave={handleMouseLeave}
                  className="w-full text-left py-4 px-2 border-b border-[var(--color-hairline)] 
                           transition-colors duration-300
                           hover:border-[var(--color-text-primary)]
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)]"
                  initial={false}
                  animate={{
                    borderColor: isActive
                      ? "var(--color-accent)"
                      : isHovered
                      ? "var(--color-text-primary)"
                      : "var(--color-hairline)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    {/* Index number */}
                    <span
                      className={`ui-label text-sm transition-colors ${
                        isActive
                          ? "text-[var(--color-accent)]"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    
                    {/* Project title */}
                    <span
                      className={`body transition-colors ${
                        isActive
                          ? "text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-secondary)]"
                      }`}
                    >
                      {project.title}
                    </span>
                    
                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right: Project Lens panel */}
          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject.id}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -20 }}
                transition={{
                  duration: reducedMotion ? 0.2 : 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="space-y-8"
              >
                <ProjectLens project={activeProject} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile: Accordion layout */}
        <div className="md:hidden space-y-4 max-w-2xl mx-auto">
          {projects.map((project, index) => {
            const isActive = project.id === activeProjectId;
            
            return (
              <div
                key={project.id}
                className="border border-[var(--color-hairline)] 
                         bg-[rgba(11,13,16,0.6)] backdrop-blur-sm"
              >
                <button
                  onClick={() => handleProjectClick(project)}
                  onMouseEnter={() => handleProjectHover(project)}
                  onMouseLeave={handleMouseLeave}
                  className="w-full text-left py-4 px-6 flex items-center justify-between
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`ui-label text-sm ${
                        isActive
                          ? "text-[var(--color-accent)]"
                          : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="body">{project.title}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  )}
                </button>
                
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: reducedMotion ? 0.2 : 0.3 }}
                    className="px-6 pb-6"
                  >
                    <ProjectLens project={project} />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface ProjectLensProps {
  project: Project;
}

function ProjectLens({ project }: ProjectLensProps) {
  return (
    <div className="space-y-8">
      {/* Thesis line */}
      <p className="font-garamond text-xl leading-tight text-[var(--color-text-primary)]">
        {project.oneLineThesis}
      </p>

      {/* What it does */}
      <div>
        <h3 className="ui-label mb-3">What it does</h3>
        <p className="body-muted leading-relaxed">{project.whatItDoes}</p>
      </div>

      {/* My role */}
      <div>
        <h3 className="ui-label mb-3">My role</h3>
        <ul className="space-y-2">
          {project.roles.map((role, i) => (
            <li
              key={i}
              className="body-muted flex items-start before:content-['•'] before:mr-2 before:mt-1 before:text-[var(--color-text-muted)]"
            >
              {role}
            </li>
          ))}
        </ul>
      </div>

      {/* Hard problems */}
      <div>
        <h3 className="ui-label mb-3">Hard problems</h3>
        <ul className="space-y-2">
          {project.hardProblems.map((problem, i) => (
            <li
              key={i}
              className="body-muted flex items-start before:content-['•'] before:mr-2 before:mt-1 before:text-[var(--color-text-muted)]"
            >
              {problem}
            </li>
          ))}
        </ul>
      </div>

      {/* Results */}
      <div>
        <h3 className="ui-label mb-3">Results</h3>
        <ul className="space-y-2">
          {project.results.map((result, i) => (
            <li
              key={i}
              className="body-muted flex items-start before:content-['•'] before:mr-2 before:mt-1 before:text-[var(--color-text-muted)]"
            >
              {result}
            </li>
          ))}
        </ul>
      </div>

      {/* Stack */}
      <div>
        <h3 className="ui-label mb-3">Stack</h3>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech, i) => (
            <span
              key={i}
              className="body-muted text-sm px-3 py-1 border border-[var(--color-hairline)] 
                       bg-[rgba(11,13,16,0.4)]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div>
        <h3 className="ui-label mb-3">Links</h3>
        <div className="flex flex-wrap gap-4">
          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="body text-[var(--color-text-secondary)] 
                       hover:text-[var(--color-accent)] transition-colors
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              GitHub
            </a>
          )}
          {project.links.writeup && (
            <a
              href={project.links.writeup}
              className="body text-[var(--color-text-secondary)] 
                       hover:text-[var(--color-accent)] transition-colors
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              Writeup
            </a>
          )}
          {project.links.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="body text-[var(--color-text-secondary)] 
                       hover:text-[var(--color-accent)] transition-colors
                       focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
