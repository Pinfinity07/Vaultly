import localFont from "next/font/local";
import "./globals.css";
import Toaster from "../components/ui/Toaster";
import { ConfirmProvider } from "../components/ui/ConfirmDialog";
import PreferencesHydrator from "../components/PreferencesHydrator";

// Fonts are bundled from ./fonts (IBM Plex, SIL Open Font License) rather than fetched
// from Google at build time, so builds do not depend on a third-party network call.
const plexSans = localFont({
  variable: "--font-plex-sans",
  display: "swap",
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

const plexMono = localFont({
  variable: "--font-plex-mono",
  display: "swap",
  src: [
    { path: "./fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
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
