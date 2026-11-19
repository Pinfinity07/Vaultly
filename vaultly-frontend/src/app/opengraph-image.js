import { ImageResponse } from "next/og";

export const alt = "Vaultly: track spending and split shared costs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Share card for links to the site. Rendered once at build time.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 36, fontWeight: 600 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "#0f172a", display: "flex" }} />
          Vaultly
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.1, letterSpacing: -1.5, maxWidth: 900 }}>
            Split rent, track spending, and save for what&apos;s next.
          </div>
          <div style={{ fontSize: 30, color: "#475569", maxWidth: 860 }}>
            Your own expenses and the ones you share with flatmates, in one place.
          </div>
        </div>
        <div style={{ display: "flex", height: 8, width: 160, background: "#0f766e", borderRadius: 4 }} />
      </div>
    ),
    size
  );
}
