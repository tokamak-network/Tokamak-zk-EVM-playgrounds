import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tokamak ZK-EVM Playground",
  description: "Developer playground for Tokamak ZK-EVM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
