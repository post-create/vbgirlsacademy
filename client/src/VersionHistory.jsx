import React from "react";
import { CHANGELOG } from "./changelog.js";

// Indstillinger -> Versionshistorik. Styles are local (App.jsx's `styles`
// object isn't exported, and importing it from here would be a cycle), with
// the same palette and fonts as the rest of the app.
const KIND = {
  nyt: { label: "Nyt", bg: "#E3F0E3", color: "#2F6B2F" },
  forbedret: { label: "Forbedret", bg: "#E3ECF4", color: "#2D5878" },
  rettet: { label: "Rettet", bg: "#F4E8D8", color: "#8A5A1E" },
};

function formatReleaseDate(iso) {
  const dt = new Date(`${iso}T00:00:00`);
  if (isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });
}

export function VersionHistoryView() {
  return (
    <div>
      <h1
        style={{
          fontFamily: "'Oswald', sans-serif",
          fontSize: 26,
          letterSpacing: 0.5,
          margin: 0,
          color: "#111111",
        }}
      >
        Versionshistorik
      </h1>
      <p style={{ color: "#6B6B6B", fontSize: 14, margin: "4px 0 20px" }}>
        Hvad der er tilføjet og ændret i appen, nyeste øverst.
      </p>

      {CHANGELOG.map((release, idx) => (
        <div
          key={release.date}
          style={{
            background: "#FFFFFF",
            border: "1px solid #E3E3E3",
            borderRadius: 12,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17, letterSpacing: 0.3, color: "#111111" }}>
              {formatReleaseDate(release.date)}
            </span>
            {idx === 0 && (
              <span
                style={{
                  background: "#E2231A",
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: 10,
                }}
              >
                Seneste
              </span>
            )}
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {release.items.map((item, i) => {
              const kind = KIND[item.kind] || KIND.nyt;
              return (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    padding: "8px 0",
                    borderTop: i === 0 ? "none" : "1px solid #F0EDE5",
                    fontSize: 14,
                    lineHeight: 1.45,
                  }}
                >
                  <span
                    style={{
                      flex: "0 0 78px",
                      textAlign: "center",
                      background: kind.bg,
                      color: kind.color,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      textTransform: "uppercase",
                      padding: "3px 0",
                      borderRadius: 6,
                      marginTop: 1,
                    }}
                  >
                    {kind.label}
                  </span>
                  <span style={{ flex: 1 }}>{item.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
