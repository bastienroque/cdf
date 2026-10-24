import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cavaleiros da Francesinha",
  description: "O guia real das francesinhas no reino,",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async&libraries=places`}
        async
      />
      {children}
    </>
  );
}
