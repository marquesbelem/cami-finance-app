"use client";

import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Next.js App Router error boundary — shown when a route segment throws
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("[App Error Boundary]", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "2rem",
        background: "var(--color-bg-base, #0d0f1a)",
      }}
      role="alert"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        <span style={{ fontSize: "3rem" }}>⚠️</span>
        <h2
          style={{
            color: "var(--color-text-primary, #f1f5f9)",
            fontSize: "1.25rem",
            fontWeight: 600,
            margin: 0,
          }}
        >
          Algo deu errado
        </h2>
        <p
          style={{
            color: "var(--color-text-secondary, #9ca3af)",
            fontSize: "0.875rem",
            margin: 0,
          }}
        >
          Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1.5rem",
            background: "var(--color-accent, #8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
