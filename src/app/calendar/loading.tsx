// Next.js App Router loading boundary for the calendar page
export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        background: "var(--color-bg-base, #0d0f1a)",
      }}
      aria-busy="true"
      aria-label="Carregando calendário..."
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "3px solid rgba(139, 92, 246, 0.2)",
            borderTopColor: "#8b5cf6",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p
          style={{
            color: "var(--color-text-secondary, #9ca3af)",
            fontSize: "0.875rem",
            margin: 0,
          }}
        >
          Carregando calendário...
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
