import { ModalProvider } from "@/components/providers/modal-providers";
import "./globals.css";
import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getCurrentUser } from "@/lib/auth";
import WelcomePage from "@/components/welcome-page";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/components/providers/query-provider";

const font = EB_Garamond({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collaboration-App",
  description:
    "An app that allows users collaborate with chat , audio, and video.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();
  return (
    <html lang="en">
      <body className={cn(font.className, "")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          storageKey="collaboration-theme"
        >
          <Toaster />
          <main>
            <ModalProvider />
            {session === null && <WelcomePage />}
            <QueryProvider>{children}</QueryProvider>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
