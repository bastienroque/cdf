"use client";

// Last-resort screen when the root layout itself fails. It renders its own
// <html> and cannot use translations, so it stays short and bilingual.
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>Something went wrong · Algo correu mal</h1>
          <button type="button" onClick={reset} style={{ padding: "8px 16px", cursor: "pointer" }}>
            Try again · Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
