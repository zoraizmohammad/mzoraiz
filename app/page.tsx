import Hero from "@/components/sections/Hero";
import Domains from "@/components/sections/Domains";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Proof from "@/components/sections/Proof";
import Notes from "@/components/sections/Notes";
import Contact from "@/components/sections/Contact";
import SceneManager from "@/components/scroll/SceneManager";
import SectionWrapper from "@/components/sections/SectionWrapper";

export default function Home() {
  return (
    <main>
      <SceneManager />
      <SectionWrapper id="hero">
        <Hero />
      </SectionWrapper>
      <SectionWrapper id="domains">
        <Domains />
      </SectionWrapper>
      <SectionWrapper id="work">
        <Projects />
      </SectionWrapper>
      <SectionWrapper id="experience">
        <Experience />
      </SectionWrapper>
      <SectionWrapper id="proof">
        <Proof />
      </SectionWrapper>
      <SectionWrapper id="notes">
        <Notes />
      </SectionWrapper>
      <SectionWrapper id="contact">
        <Contact />
      </SectionWrapper>
    </main>
  );
}
