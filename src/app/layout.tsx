import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
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
    url: "",
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
    <>
      <script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&loading=async&libraries=places`}
        async
      />
      {children}
    </>
  );
}
