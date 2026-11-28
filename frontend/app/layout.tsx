import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Invest Fácil — educação financeira sem promessas",
    template: "%s · Invest Fácil",
  },
  description:
    "Aprenda a investir antes de colocar seu dinheiro em risco. Trilhas curtas, quizzes, simulações educativas e gamificação honesta.",
  applicationName: "Invest Fácil",
  keywords: [
    "educação financeira",
    "investimentos",
    "renda fixa",
    "renda variável",
    "criptomoedas",
    "simulador financeiro",
  ],
  authors: [{ name: "Invest Fácil" }],
  openGraph: {
    title: "Invest Fácil",
    description: "Educação financeira para quem está começando de verdade.",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
