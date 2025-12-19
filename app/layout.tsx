import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import NetworkCanvas from "@/components/overlays/NetworkCanvas";
import GradientSpotlight from "@/components/overlays/GradientSpotlight";
import VignetteOverlay from "@/components/overlays/VignetteOverlay";
import GrainOverlay from "@/components/overlays/GrainOverlay";

export const metadata: Metadata = {
  title: "Information Diffusion Portfolio - Mohammad Zoraiz",
  description: "Portfolio website for Mohammad Zoraiz",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[var(--color-background)] text-[var(--color-text-primary)] antialiased">
        <NetworkCanvas />
        <GradientSpotlight />
        <Navigation />
        <div className="relative z-20">{children}</div>
        <VignetteOverlay />
        <GrainOverlay />
      </body>
    </html>
  );
}
