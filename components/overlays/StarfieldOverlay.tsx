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

    // Generate stars - mix of small and bright stars
    const starCount = 1500;
    const stars: Array<{
      x: number;
      y: number;
      radius: number;
      brightness: number;
      twinkleSpeed: number;
      twinklePhase: number;
      isBright: boolean;
    }> = [];

    for (let i = 0; i < starCount; i++) {
      const isBright = Math.random() < 0.15; // 15% are bright stars
      stars.push({
        x: Math.random() * canvas.width / (window.devicePixelRatio || 1),
        y: Math.random() * canvas.height / (window.devicePixelRatio || 1),
        radius: isBright 
          ? Math.random() * 1.2 + 0.8  // Bright stars: 0.8-2.0px
          : Math.random() * 0.6 + 0.4,  // Regular stars: 0.4-1.0px
        brightness: isBright
          ? Math.random() * 0.4 + 0.7  // Bright stars: 0.7-1.0
          : Math.random() * 0.5 + 0.5, // Regular stars: 0.5-1.0
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        isBright,
      });
    }

    // Generate nebula clouds (more vibrant and visible)
    const nebulaCount = 5;
    const nebulas: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      opacity: number;
    }> = [];

    for (let i = 0; i < nebulaCount; i++) {
      const colors = [
        "rgba(111, 168, 255, 0.4)",  // Accent blue - more vibrant
        "rgba(138, 43, 226, 0.35)",  // Purple - more vibrant
        "rgba(255, 192, 203, 0.25)", // Pink - more vibrant
        "rgba(100, 149, 237, 0.3)",  // Cornflower blue
        "rgba(186, 85, 211, 0.3)",   // Medium orchid
      ];
      
      nebulas.push({
        x: Math.random() * canvas.width / (window.devicePixelRatio || 1),
        y: Math.random() * canvas.height / (window.devicePixelRatio || 1),
        radius: Math.random() * 500 + 400, // Larger clouds: 400-900px
        color: colors[i % colors.length],
        opacity: Math.random() * 0.2 + 0.3, // Higher base opacity: 0.3-0.5
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
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.2 + 0.8;
        const opacity = star.brightness * twinkle;

        // Bright stars get a glow effect
        if (star.isBright && opacity > 0.8) {
          // Outer glow
          const glowGradient = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.radius * 3
          );
          glowGradient.addColorStop(0, `rgba(230, 228, 223, ${opacity * 0.3})`);
          glowGradient.addColorStop(1, "transparent");
          
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Star core
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
      style={{ 
        mixBlendMode: "screen",
        opacity: 0.9, // Slightly reduce overall opacity to balance with network
      }}
    />
  );
}

