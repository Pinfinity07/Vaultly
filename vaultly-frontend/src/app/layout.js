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

const description =
  "Track your own spending and the costs you share with flatmates, see where the month went, and save toward goals.";

// The icon (app/icon.svg) and share image (app/opengraph-image.js) come from file conventions.
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://vaultly-one.vercel.app"),
  title: {
    default: "Vaultly · Track spending and split shared costs",
    template: "%s · Vaultly",
  },
  description,
  openGraph: {
    title: "Vaultly · Track spending and split shared costs",
    description,
    siteName: "Vaultly",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  themeColor: "#f8fafc",
  viewportFit: "cover",
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
