import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Toaster from "../components/ui/Toaster";
import { ConfirmProvider } from "../components/ui/ConfirmDialog";
import PreferencesHydrator from "../components/PreferencesHydrator";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "Vaultly - Finance Tracker",
  description: "Track and manage your expenses with advanced filters and analytics",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <PreferencesHydrator />
        <ConfirmProvider>
          {children}
        </ConfirmProvider>
        <Toaster />
      </body>
    </html>
  );
}
