interface ProgressBarProps {
  openedCards: Set<string>;
  realCardIds: string[];
}

const CARD_LABELS: Record<string, string> = {
  "best-arcs": "Best Arcs",
  "separation-arc": "Sep Arc",
  "beefing-arcs": "Beefing",
  "memories": "Memories",
};

export default function ProgressBar({ openedCards, realCardIds }: ProgressBarProps) {
  const count = realCardIds.filter(id => openedCards.has(id)).length;
  const total = realCardIds.length;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px 20px",
      gap: "10px",
      background: "linear-gradient(180deg, rgba(0,0,16,0.85) 0%, transparent 100%)",
      pointerEvents: "none",
    }}>
      <div style={{
        color: "rgba(150,180,255,0.6)",
        fontSize: "10px",
        fontFamily: "system-ui, sans-serif",
        letterSpacing: "0.15em",
        fontWeight: "700",
        whiteSpace: "nowrap",
      }}>
        EXPLORED
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {realCardIds.map((id, idx) => {
          const done = openedCards.has(id);
          return (
            <div
              key={id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: done
                  ? "linear-gradient(135deg, #4ade80, #22c55e)"
                  : "rgba(255,255,255,0.07)",
                border: done
                  ? "2px solid #4ade8088"
                  : "2px dashed rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                boxShadow: done ? "0 0 12px #4ade8066, 0 0 24px #22c55e33" : "none",
                transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                transform: done ? "scale(1.1)" : "scale(1)",
              }}>
                {done ? "✓" : <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>{idx + 1}</span>}
              </div>
              <div style={{
                fontSize: "8px",
                fontFamily: "system-ui, sans-serif",
                letterSpacing: "0.06em",
                color: done ? "#4ade80bb" : "rgba(255,255,255,0.2)",
                transition: "color 0.3s ease",
                whiteSpace: "nowrap",
              }}>
                {CARD_LABELS[id]}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        color: count === total ? "#4ade80" : "rgba(150,180,255,0.6)",
        fontSize: "11px",
        fontFamily: "system-ui, sans-serif",
        letterSpacing: "0.1em",
        fontWeight: "700",
        transition: "color 0.3s ease",
        whiteSpace: "nowrap",
      }}>
        {count}/{total}
      </div>
    </div>
  );
}
