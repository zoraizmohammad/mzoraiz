"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef } from "react";
import { useSceneStore } from "@/store/sceneStore";
import { fieldNotes, type FieldNote } from "@/content/notes";

export default function Notes() {
  const reducedMotion = useReducedMotion();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { setAmbientMode } = useSceneStore();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleToggle = (noteId: string) => {
    if (expandedId === noteId) {
      // Closing the currently expanded note
      setExpandedId(null);
      setAmbientMode("normal");
    } else {
      // Opening a new note (or switching from one to another)
      setExpandedId(noteId);
      setAmbientMode("calm");
    }
  };
  
  // Reset ambient mode when component unmounts or all notes are closed
  useEffect(() => {
    if (!expandedId) {
      setAmbientMode("normal");
    }
  }, [expandedId, setAmbientMode]);

  return (
    <section
      ref={sectionRef}
      id="notes"
      className="relative min-h-[100vh] flex items-center justify-center py-20"
    >
      <div className="container mx-auto px-4">
        {/* Section title */}
        <motion.h2
          className="h2-section text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: reducedMotion ? 0.3 : 0.6 }}
        >
          Field Notes
        </motion.h2>

        {/* Notes list */}
        <div className="max-w-3xl mx-auto space-y-6">
          {fieldNotes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              index={index}
              isExpanded={expandedId === note.id}
              onToggle={() => handleToggle(note.id)}
              reducedMotion={reducedMotion}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface NoteCardProps {
  note: FieldNote;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  reducedMotion: boolean | null;
  isInView: boolean;
}

function NoteCard({
  note,
  index,
  isExpanded,
  onToggle,
  reducedMotion,
  isInView,
}: NoteCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const cardInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={
        isInView && cardInView
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 20 }
      }
      transition={{
        duration: reducedMotion ? 0.3 : 0.5,
        delay: reducedMotion ? 0 : index * 0.1,
      }}
      className="border border-[var(--color-hairline)] bg-[rgba(11,13,16,0.3)] 
                 backdrop-blur-sm"
    >
      {/* Card header */}
      <div className="p-6">
        <h3 className="font-garamond text-xl mb-3 text-[var(--color-text-primary)]">
          {note.title}
        </h3>
        <p className="body-muted mb-4 leading-relaxed">{note.abstract}</p>
        <button
          onClick={onToggle}
          className="body text-[var(--color-text-secondary)] 
                   hover:text-[var(--color-accent)] transition-colors
                   focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] 
                   px-4 py-2 border border-[var(--color-hairline)] 
                   hover:border-[var(--color-accent)]"
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Close" : "Read"}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, height: 0 }}
          animate={reducedMotion ? {} : { opacity: 1, height: "auto" }}
          exit={reducedMotion ? {} : { opacity: 0, height: 0 }}
          transition={
            reducedMotion
              ? {}
              : {
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }
          }
          className="border-t border-[var(--color-hairline)] p-6 pt-6"
        >
          <div className="prose prose-invert max-w-none">
            <div className="body-muted leading-relaxed whitespace-pre-line">
              {note.content}
            </div>

            {/* Diagram placeholder */}
            {note.diagramPlaceholder && (
              <div className="mt-6 pt-6 border-t border-[var(--color-hairline)]">
                <div className="w-full h-48 bg-[rgba(11,13,16,0.5)] 
                              border border-[var(--color-hairline)] 
                              flex items-center justify-center">
                  <p className="body-muted text-sm text-center px-4">
                    {note.diagramPlaceholder}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
