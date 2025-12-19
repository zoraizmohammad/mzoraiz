import Hero from "@/components/sections/Hero";
import Domains from "@/components/sections/Domains";
import Projects from "@/components/sections/Projects";
import Experience from "@/components/sections/Experience";
import Proof from "@/components/sections/Proof";
import Notes from "@/components/sections/Notes";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <Domains />
      <Projects />
      <Experience />
      <Proof />
      <Notes />
      <Contact />
    </main>
  );
}
