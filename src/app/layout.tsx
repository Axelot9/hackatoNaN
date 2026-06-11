import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AutoclAIm",
  description: "Construye casos de reclamación sólidos con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
