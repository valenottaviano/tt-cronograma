'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { PWAInstallToast } from "@/components/pwa-install-toast";
import { AuthProvider } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Dynamic manifest and app name based on route
  const manifestUrl = isAdminRoute ? '/manifest-admin.json' : '/manifest.json';
  const appName = isAdminRoute ? 'TT Admin' : 'Grupo TT';

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>{appName}</title>
        <meta
          name="description"
          content={isAdminRoute ? "Panel de administración TT" : "Grupo de Entrenamiento TT - Running y Trail Running"}
        />
        <link rel="manifest" href={manifestUrl} />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={appName} />
        <link rel="apple-touch-icon" href="/ios/180.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            {!isAdminRoute && <Navbar />}
            {children}
            {!isAdminRoute && <Footer />}
            <Toaster />
            {!isAdminRoute && <PWAInstallToast />}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

