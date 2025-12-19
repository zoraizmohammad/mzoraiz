import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}

