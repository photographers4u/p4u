import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function OpengraphImage() {
  const logoBuffer = await readFile(
    join(process.cwd(), "public", "logo-192.png"),
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        background: "linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 140,
          height: 140,
          borderRadius: 32,
          background: "white",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: ImageResponse requires plain <img> */}
        <img src={logoSrc} width={96} height={96} alt="" />
      </div>
      <div
        style={{
          color: "white",
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        Photographers4U
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: 30,
          fontWeight: 500,
        }}
      >
        Hire verified photographers across India
      </div>
    </div>,
    { ...size },
  );
}
