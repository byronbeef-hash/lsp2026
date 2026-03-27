import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ApiDataProvider } from "@/components/auth/ApiDataProvider";

export const metadata: Metadata = {
  title: "LiveStock Manager",
  description: "Modern livestock management platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LiveStock",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000040",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <ApiDataProvider>{children}</ApiDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
