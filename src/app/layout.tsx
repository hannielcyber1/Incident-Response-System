import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { SidebarSpacer } from "@/components/SidebarSpacer";
import { SidebarProvider } from "@/components/SidebarContext";
import { getUser } from "@/lib/auth";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Incident Response System",
  description: "Enterprise Incident Response System",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f4f4fd] dark:bg-[#0b1326] text-[#1a1b2e] dark:text-[#dae2fd] relative font-sans transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Tech grid background */}
          <div className="bg-tech-grid fixed inset-0 z-0 pointer-events-none" />

          {/* Dark mode glow orbs */}
          <div className="dark:block hidden fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px]" />
            <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-purple-900/10 blur-[100px]" />
          </div>

          {user ? (
            <SidebarProvider>
              <div className="relative z-10 flex min-h-screen">
                <Sidebar />
                <SidebarSpacer />
                <div className="flex flex-col flex-grow min-w-0">
                  <Navbar />
                  <main className="flex-grow p-4 lg:p-6 bg-tech-grid">{children}</main>
                </div>
              </div>
            </SidebarProvider>
          ) : (
            <div className="relative z-10 flex flex-col min-h-screen">
              <main className="flex-grow">{children}</main>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
