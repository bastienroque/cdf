import "./globals.css";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Cavaleiros da Francesinha",
    template: "%s | Cavaleiros da Francesinha",
  },
  description:
    "O guia real das Francesinhas deste reino. Descubra os melhores locais para saborear esta iguaria portuguesa.",
  openGraph: {
    title: "Cavaleiros da Francesinha",
    description:
      "O guia real das Francesinhas deste reino. Descubra os melhores locais para saborear esta iguaria portuguesa.",
    url: siteUrl(),
    siteName: "Cavaleiros da Francesinha",
    locale: "pt_PT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>{children}</>
  );
}
