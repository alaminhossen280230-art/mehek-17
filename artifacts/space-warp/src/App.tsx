import { useState } from "react";
import WarpCanvas from "./components/WarpCanvas";
import SolarSystem from "./components/SolarSystem";
import CardModal from "./components/CardModal";
import ProgressBar from "./components/ProgressBar";
import BirthdayPage from "./pages/BirthdayPage";
import AmbientMusic from "./components/AmbientMusic";

export type Phase = "warp" | "arriving" | "orbit" | "birthday";

export interface CardData {
  id: string;
  title: string;
  description: string;
  detail: string;
  color: string;
  glow: string;
  icon: string;
  gif?: string;
}

export const CARDS: CardData[] = [
  {
    id: "best-arcs",
    title: "Best Arcs",
    description: "✨ the greatest of all time ✨",
    detail: "The ones that made it all worth it.",
    color: "#ffd700",
    glow: "#ff9900",
    icon: "👑",
    gif: "/best-arcs.gif",
  },
  {
    id: "separation-arc",
    title: "Great Separation Arc",
    description: "shes hoite hoite Hoy nai",
    detail: "shes hoite hoite Hoy nai",
    color: "#60c8f5",
    glow: "#1a8fc4",
    icon: "🐧",
    gif: "/pengu.gif",
  },
  {
    id: "beefing-arcs",
    title: "Beefing Arcs",
    description: "✦ drama in the cosmos ✦",
    detail: "When two celestial bodies refuse to get along, the universe throws hands. Beefing Arcs are the dramatic storylines written in stardust — intense, chaotic, and totally iconic. No notes. 🐾",
    color: "#ff85c2",
    glow: "#ff4da6",
    icon: "🐾",
    gif: "/beefing-arcs.gif",
  },
  {
    id: "memories",
    title: "Memories",
    description: "games and stuff",
    detail: "games and stuff",
    color: "#c084fc",
    glow: "#9333ea",
    icon: "🎮",
    gif: "/memories.gif",
  },
  {
    id: "coming-soon-1",
    title: "Coming Soon",
    description: "???",
    detail: "",
    color: "#a78bfa",
    glow: "#7c3aed",
    icon: "🌙",
  },
  {
    id: "coming-soon-2",
    title: "Coming Soon",
    description: "???",
    detail: "",
    color: "#f472b6",
    glow: "#db2777",
    icon: "⭐",
  },
];

export const REAL_CARD_IDS = ["best-arcs", "separation-arc", "beefing-arcs", "memories"];

export default function App() {
  const [phase, setPhase] = useState<Phase>("warp");
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [openedCards, setOpenedCards] = useState<Set<string>>(new Set());

  const handleCardClick = (card: CardData) => {
    if (!card.id.startsWith("coming-soon")) {
      setOpenedCards(prev => new Set([...prev, card.id]));
    }
    setSelectedCard(card);
  };

  const allOpened = REAL_CARD_IDS.every(id => openedCards.has(id));

  if (phase === "birthday") return <BirthdayPage />;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000010", overflow: "hidden", position: "relative" }}>
      <AmbientMusic phase={phase} />

      <WarpCanvas
        active={phase === "warp" || phase === "arriving"}
        phase={phase}
        onWarpComplete={() => setPhase("arriving")}
        onArrived={() => setPhase("orbit")}
      />

      {phase === "orbit" && (
        <>
          <ProgressBar openedCards={openedCards} realCardIds={REAL_CARD_IDS} />
          <SolarSystem onCardClick={handleCardClick} />
        </>
      )}

      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}

      {phase === "orbit" && !selectedCard && (
        <>
          <div style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            color: "rgba(150, 180, 255, 0.55)",
            fontSize: "12px",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "0.12em",
            pointerEvents: "none",
            userSelect: "none",
          }}>
            DRAG TO ROTATE &nbsp;·&nbsp; TAP TO EXPLORE
          </div>

          {allOpened && (
            <button
              onClick={() => setPhase("birthday")}
              style={{
                position: "fixed",
                bottom: 60,
                left: "50%",
                transform: "translateX(-50%)",
                background: "linear-gradient(135deg, #ff85c2, #c084fc, #ff85c2)",
                backgroundSize: "200% 200%",
                animation: "shimmerBtn 2s ease infinite",
                border: "none",
                borderRadius: "50px",
                padding: "14px 32px",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "800",
                fontFamily: "system-ui, sans-serif",
                cursor: "pointer",
                letterSpacing: "0.05em",
                boxShadow: "0 0 30px #ff85c288, 0 0 60px #c084fc44",
                zIndex: 100,
              }}
            >
              🎂 Next →
            </button>
          )}
        </>
      )}

      <style>{`
        @keyframes shimmerBtn {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
