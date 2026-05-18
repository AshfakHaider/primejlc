import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "Prime Japanese Language Centre CRM",
  description: "Agency management CRM for Japanese language and Japan study visa operations.",
  icons: {
    icon: "/brand/prime-logo-full.jpeg",
    apple: "/brand/prime-logo-full.jpeg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
