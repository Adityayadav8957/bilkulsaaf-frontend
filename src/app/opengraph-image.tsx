import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#131312",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2 }}>
          BilkulSaaf
        </div>
        <div style={{ fontSize: 28, color: "#a09c92", marginTop: 20 }}>
          a public register of totally honest people
        </div>
      </div>
    ),
    { ...size }
  );
}
