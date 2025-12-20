"use client";

import { useEffect, useRef } from "react";

export default function StarfieldOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Generate stars
    const starCount = 800;
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      brightness: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }> = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width / (window.devicePixelRatio || 1),
        y: Math.random() * canvas.height / (window.devicePixelRatio || 1),
        radius: Math.random() * 0.5 + 0.3,
        brightness: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // Generate nebula clouds (soft gradients)
    const nebulaCount = 3;
    const nebulas: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      opacity: number;
    }> = [];

    for (let i = 0; i < nebulaCount; i++) {
      nebulas.push({
        x: Math.random() * canvas.width / (window.devicePixelRatio || 1),
        y: Math.random() * canvas.height / (window.devicePixelRatio || 1),
        radius: Math.random() * 400 + 300,
        color: i === 0 
          ? "rgba(111, 168, 255, 0.15)" // Accent blue
          : i === 1
          ? "rgba(138, 43, 226, 0.1)" // Purple
          : "rgba(255, 192, 203, 0.08)", // Pink
        opacity: Math.random() * 0.3 + 0.2,
      });
    }

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

      // Draw nebulas
      nebulas.forEach((nebula) => {
        const gradient = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.radius
        );
        gradient.addColorStop(0, nebula.color);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw stars with twinkle
      stars.forEach((star) => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
        const opacity = star.brightness * twinkle;

        ctx.fillStyle = `rgba(230, 228, 223, ${opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

