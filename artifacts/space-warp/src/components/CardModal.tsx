import { useEffect } from "react";
import { CardData } from "../App";

interface CardModalProps {
  card: CardData;
  onClose: () => void;
}

function Pin({ accent }: { accent: string }) {
  return (
    <div style={{
      position: "absolute",
      top: -10,
      left: "50%",
      transform: "translateX(-50%)",
      width: 14,
      height: 14,
      borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, #fff, ${accent})`,
      boxShadow: `0 2px 6px rgba(0,0,0,0.5), 0 0 8px ${accent}88`,
      zIndex: 2,
    }} />
  );
}

function Polaroid({ src, caption, rotate, accent, delay = 0 }: {
  src: string; caption: string; rotate: number; accent: string; delay?: number;
}) {
  return (
    <div
      style={{
        background: "#1a1a1f",
        borderRadius: "8px",
        padding: caption ? "8px 8px 28px" : "8px 8px 14px",
        border: `1px solid ${accent}44`,
        boxShadow: `0 6px 24px rgba(0,0,0,0.6), 0 0 12px ${accent}22`,
        transform: `rotate(${rotate}deg)`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        animation: `floatIn 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
        position: "relative",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) scale(1.04)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 14px 40px rgba(0,0,0,0.7), 0 0 20px ${accent}44`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = `rotate(${rotate}deg)`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 6px 24px rgba(0,0,0,0.6), 0 0 12px ${accent}22`;
      }}
    >
      <Pin accent={accent} />
      <img src={src} alt={caption} draggable={false} style={{ width: "100%", display: "block", borderRadius: "4px", objectFit: "cover", maxHeight: "140px" }} />
      {caption && (
        <div style={{ textAlign: "center", marginTop: "8px", fontSize: "11px", fontFamily: "system-ui, sans-serif", color: accent, fontStyle: "italic", letterSpacing: "0.04em", whiteSpace: "pre-line", lineHeight: 1.6 }}>
          {caption}
        </div>
      )}
    </div>
  );
}

function ComingSoon({ rotate, accent, delay = 0, caption = "" }: { rotate: number; accent: string; delay?: number; caption?: string }) {
  return (
    <div
      style={{
        background: "#1a1a1f",
        borderRadius: "8px",
        padding: "8px 8px 28px",
        border: `1px dashed ${accent}55`,
        boxShadow: `0 6px 24px rgba(0,0,0,0.4), 0 0 8px ${accent}11`,
        transform: `rotate(${rotate}deg)`,
        transition: "transform 0.2s ease",
        animation: `floatIn 0.5s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
        position: "relative",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) scale(1.04)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = `rotate(${rotate}deg)`; }}
    >
      <Pin accent={accent} />
      <div style={{
        height: "120px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        borderRadius: "4px",
        background: `${accent}08`,
      }}>
        <div style={{ fontSize: "28px", opacity: 0.4 }}>🕰️</div>
        <div style={{ fontSize: "11px", color: `${accent}88`, fontStyle: "italic", letterSpacing: "0.06em" }}>coming soon...</div>
      </div>
      {caption && (
        <div style={{ textAlign: "center", marginTop: "8px", fontSize: "10px", fontFamily: "system-ui, sans-serif", letterSpacing: "0.02em", lineHeight: 1.5, color: "rgba(200,220,255,0.75)", fontStyle: "italic" }}>
          {caption.replace(/\(.*\)/, "").trim()}
          {caption.includes("(") && (
            <span style={{ color: "#ff4444", display: "block", marginTop: "3px" }}>
              {caption.match(/\(.*\)/)?.[0]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function CloseBtn({ onClose, color }: { onClose: () => void; color: string }) {
  return (
    <button
      onClick={onClose}
      style={{
        marginTop: "20px",
        background: `linear-gradient(135deg, ${color}cc, ${color}99)`,
        color: "white",
        border: "none",
        borderRadius: "100px",
        padding: "11px 30px",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer",
        fontFamily: "system-ui, sans-serif",
        letterSpacing: "0.06em",
        boxShadow: `0 4px 20px ${color}44`,
        transition: "transform 0.15s ease",
      }}
      onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "scale(1.05)"; }}
      onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "scale(1)"; }}
    >
      ✦ back to the cosmos ✦
    </button>
  );
}

export default function CardModal({ card, onClose }: CardModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isBeefing = card.id === "beefing-arcs";
  const isSeparation = card.id === "separation-arc";
  const isBest = card.id === "best-arcs";
  const isMemories = card.id === "memories";
  const isComingSoon = card.id.startsWith("coming-soon");
  const isCustom = isBeefing || isSeparation || isBest || isMemories || isComingSoon;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: isCustom ? "rgba(8,0,12,0.90)" : "rgba(0,0,10,0.75)",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isBeefing
            ? "linear-gradient(160deg, #1a0012 0%, #0d0008 60%, #1a0005 100%)"
            : isSeparation
            ? "linear-gradient(160deg, #001a2e 0%, #000d1a 60%, #001022 100%)"
            : isBest
            ? "linear-gradient(160deg, #1a1200 0%, #0d0a00 50%, #1a1000 100%)"
            : isMemories
            ? "linear-gradient(160deg, #120a1a 0%, #08000f 50%, #100818 100%)"
            : `radial-gradient(ellipse at top, ${card.color}22, #04020e)`,
          border: isBeefing
            ? "1px solid #ff85c233"
            : isSeparation
            ? "1px solid #60c8f533"
            : isBest
            ? "1px solid #ffd70044"
            : isMemories
            ? "1px solid #c084fc33"
            : `1px solid ${card.color}55`,
          borderRadius: "28px",
          padding: isCustom ? "32px 28px 28px" : "48px 40px",
          maxWidth: isCustom ? "640px" : "420px",
          width: "100%",
          textAlign: "center",
          position: "relative",
          boxShadow: isBeefing
            ? "0 0 80px #ff85c222, 0 0 160px #ff000011"
            : isSeparation
            ? "0 0 80px #60c8f522, 0 0 160px #1a8fc411"
            : isBest
            ? "0 0 80px #ffd70033, 0 0 160px #ff990022"
            : isMemories
            ? "0 0 80px #c084fc22, 0 0 160px #9333ea11"
            : `0 0 60px ${card.color}33`,
          animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >

        {/* ── BEEFING ARCS ── */}
        {isBeefing && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "6px" }}>
              <img src={card.gif} alt="" style={{ width: 48, height: 48, objectFit: "contain", filter: "drop-shadow(0 0 8px #ff85c299)" }} />
              <h2 style={{ color: "#fff", fontSize: "26px", fontWeight: "900", margin: 0, textShadow: "0 0 20px #ff85c2aa" }}>
                Beefing Arcs 🐾
              </h2>
              <img src={card.gif} alt="" style={{ width: 48, height: 48, objectFit: "contain", filter: "drop-shadow(0 0 8px #ff85c299)", transform: "scaleX(-1)" }} />
            </div>
            <div style={{ color: "#ff85c255", fontSize: "12px", letterSpacing: "0.2em", marginBottom: "24px" }}>· · · THE EVIDENCE · · ·</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ff85c218", border: "1px solid #ff85c244", borderRadius: "100px", padding: "5px 14px", marginBottom: "16px", fontSize: "11px", fontWeight: "700", color: "#ffb3d9", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  🩷 Small Fights
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "10px" }}>
                  <Polaroid src="/fight-just.jpg" caption="" rotate={-3} accent="#ff85c2" delay={0.1} />
                  <Polaroid src="/fight-do-what-u-want.jpg" caption="" rotate={2.5} accent="#ff85c2" delay={0.2} />
                </div>
              </div>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ff000018", border: "1px solid #ff000055", borderRadius: "100px", padding: "5px 14px", marginBottom: "16px", fontSize: "11px", fontWeight: "700", color: "#ff6666", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  🚨 Serious Fights
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingTop: "10px" }}>
                  <Polaroid src="/fight-never-talk.jpg" caption="" rotate={3} accent="#ff4444" delay={0.3} />
                  <Polaroid src="/fight-fine.jpg" caption="" rotate={-2} accent="#ff4444" delay={0.4} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: "24px", fontSize: "11px", color: "#ff85c244", letterSpacing: "0.15em" }}>· · · ✦ · · ·</div>
            <CloseBtn onClose={onClose} color="#ff85c2" />
          </>
        )}

        {/* ── GREAT SEPARATION ARC ── */}
        {isSeparation && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "6px" }}>
              <img src={card.gif} alt="" style={{ width: 52, height: 52, objectFit: "contain", filter: "drop-shadow(0 0 10px #60c8f588)" }} />
              <h2 style={{ color: "#fff", fontSize: "24px", fontWeight: "900", margin: 0, textShadow: "0 0 20px #60c8f5aa", letterSpacing: "-0.01em" }}>
                Great Separation Arc 🐧
              </h2>
              <img src={card.gif} alt="" style={{ width: 52, height: 52, objectFit: "contain", filter: "drop-shadow(0 0 10px #60c8f588)", transform: "scaleX(-1)" }} />
            </div>

            <div style={{ color: "#60c8f555", fontSize: "12px", letterSpacing: "0.2em", marginBottom: "24px" }}>· · · THE EVIDENCE · · ·</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start", paddingTop: "8px" }}>
              <Polaroid
                src="/sep-hoes.jpg"
                caption="10 April 2026"
                rotate={-3}
                accent="#60c8f5"
                delay={0.1}
              />
              <ComingSoon rotate={2.5} accent="#60c8f5" delay={0.25} caption="our first separation (due to the message being too far up in the chat, I couldn't locate it)" />
            </div>

            <div style={{ marginTop: "24px", fontSize: "11px", color: "#60c8f533", letterSpacing: "0.15em" }}>· · · ✦ · · ·</div>
            <CloseBtn onClose={onClose} color="#60c8f5" />
          </>
        )}

        {/* ── COMING SOON ── */}
        {isComingSoon && (
          <>
            <div style={{ marginBottom: "8px", fontSize: "14px", color: "#6b728066", letterSpacing: "0.25em" }}>· · · · ·</div>

            {/* Big mystery question marks */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
              animation: "crownBob 3s ease-in-out infinite",
            }}>
              <span style={{ fontSize: "72px", color: "#6b728055", filter: "blur(1px)", lineHeight: 1 }}>?</span>
              <span style={{ fontSize: "90px", color: "#6b728077", lineHeight: 1, marginTop: "-10px" }}>?</span>
              <span style={{ fontSize: "72px", color: "#6b728055", filter: "blur(1px)", lineHeight: 1 }}>?</span>
            </div>

            <div style={{ color: "#9ca3af", fontSize: "18px", fontWeight: "800", letterSpacing: "0.12em", marginBottom: "8px", fontFamily: "system-ui, sans-serif" }}>
              Coming Soon
            </div>

            {/* Animated dots */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "2px", fontSize: "16px", fontWeight: "700", color: "#6b728088", fontFamily: "system-ui, sans-serif", marginBottom: "28px" }}>
              <span>something's cooking</span>
              <span style={{ animation: "dot1 1.5s ease-in-out infinite", opacity: 0 }}>.</span>
              <span style={{ animation: "dot2 1.5s ease-in-out infinite", opacity: 0 }}>.</span>
              <span style={{ animation: "dot3 1.5s ease-in-out infinite", opacity: 0 }}>.</span>
            </div>

            <CloseBtn onClose={onClose} color="#6b7280" />

            <style>{`
              @keyframes crownBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
              @keyframes dot1 { 0%,20%,100% { opacity: 0; } 30%,90% { opacity: 1; } }
              @keyframes dot2 { 0%,40%,100% { opacity: 0; } 50%,90% { opacity: 1; } }
              @keyframes dot3 { 0%,60%,100% { opacity: 0; } 70%,90% { opacity: 1; } }
            `}</style>
          </>
        )}

        {/* ── MEMORIES ── */}
        {isMemories && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px" }}>
              <img src={card.gif} alt="" style={{ width: 52, height: 52, objectFit: "contain", filter: "drop-shadow(0 0 10px #c084fc88)" }} />
              <h2 style={{ color: "#c084fc", fontSize: "26px", fontWeight: "900", margin: 0, textShadow: "0 0 20px #c084fcaa", letterSpacing: "0.02em" }}>
                Memories
              </h2>
              <img src={card.gif} alt="" style={{ width: 52, height: 52, objectFit: "contain", filter: "drop-shadow(0 0 10px #c084fc88)", transform: "scaleX(-1)" }} />
            </div>

            <div style={{ color: "#c084fc55", fontSize: "12px", letterSpacing: "0.2em", marginBottom: "48px" }}>· · · games and stuff · · ·</div>

            {/* Animated coming soon */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              padding: "40px 20px",
              background: "radial-gradient(ellipse, #c084fc0e 0%, transparent 70%)",
              borderRadius: "20px",
              border: "1px dashed #c084fc22",
              marginBottom: "32px",
            }}>
              <img src={card.gif} alt="" style={{ width: 72, height: 72, objectFit: "contain", opacity: 0.5, filter: "drop-shadow(0 0 12px #c084fc66)" }} />
              <div style={{ display: "flex", alignItems: "baseline", gap: "2px", fontSize: "18px", fontWeight: "700", color: "#c084fcaa", fontFamily: "system-ui, sans-serif", letterSpacing: "0.04em" }}>
                <span>coming soon</span>
                <span style={{ animation: "dot1 1.5s ease-in-out infinite", opacity: 0 }}>.</span>
                <span style={{ animation: "dot2 1.5s ease-in-out infinite", opacity: 0 }}>.</span>
                <span style={{ animation: "dot3 1.5s ease-in-out infinite", opacity: 0 }}>.</span>
              </div>
            </div>

            <div style={{ marginBottom: "4px", fontSize: "11px", color: "#c084fc44", letterSpacing: "0.15em" }}>· · · ✦ · · ·</div>
            <CloseBtn onClose={onClose} color="#c084fc" />

            <style>{`
              @keyframes dot1 { 0%,20%,100% { opacity: 0; } 30%,90% { opacity: 1; } }
              @keyframes dot2 { 0%,40%,100% { opacity: 0; } 50%,90% { opacity: 1; } }
              @keyframes dot3 { 0%,60%,100% { opacity: 0; } 70%,90% { opacity: 1; } }
            `}</style>
          </>
        )}

        {/* ── BEST ARCS ── */}
        {isBest && (
          <>
            {/* Floating stars */}
            <div style={{ position: "absolute", inset: 0, borderRadius: "28px", overflow: "hidden", pointerEvents: "none" }}>
              {["✦","✧","★","✦","✧","★","✦"].map((s, i) => (
                <span key={i} style={{
                  position: "absolute",
                  fontSize: `${10 + (i % 3) * 5}px`,
                  color: i % 2 === 0 ? "#ffd700" : "#ff9900",
                  opacity: 0.35,
                  top: `${8 + i * 12}%`,
                  left: i % 2 === 0 ? `${4 + i * 6}%` : `${80 - i * 6}%`,
                  animation: `crownBob ${1.5 + i * 0.3}s ease-in-out infinite`,
                }}>{s}</span>
              ))}
            </div>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
              <img src={card.gif} alt="" style={{ width: 56, height: 56, objectFit: "contain", filter: "drop-shadow(0 0 10px #ffd700aa)" }} />
              <div>
                <div style={{ fontSize: "22px", marginBottom: "2px" }}>👑</div>
                <h2 style={{ color: "#ffd700", fontSize: "24px", fontWeight: "900", margin: 0, textShadow: "0 0 20px #ffd700aa, 0 0 40px #ff9900aa", letterSpacing: "0.02em" }}>
                  Best Arcs
                </h2>
              </div>
              <img src={card.gif} alt="" style={{ width: 56, height: 56, objectFit: "contain", filter: "drop-shadow(0 0 10px #ffd700aa)", transform: "scaleX(-1)" }} />
            </div>

            <div style={{ color: "#ffd70066", fontSize: "12px", letterSpacing: "0.2em", marginBottom: "16px" }}>· · · ✨ THE GOAT ERA ✨ · · ·</div>

            {/* Central GIF showcase */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "18px",
              marginBottom: "24px",
              padding: "20px",
              background: "radial-gradient(ellipse, #ffd70015 0%, transparent 70%)",
              borderRadius: "20px",
              border: "1px solid #ffd70022",
            }}>
              <img src={card.gif} alt="" style={{ width: 90, height: 90, objectFit: "contain", filter: "drop-shadow(0 0 16px #ffd700bb)" }} />
              <div style={{ textAlign: "left" }}>
                <div style={{ color: "#ffd700", fontSize: "13px", fontWeight: "800", letterSpacing: "0.05em", marginBottom: "6px" }}>✨ the goat era ✨</div>
                <div style={{ color: "rgba(255,220,100,0.7)", fontSize: "12px", fontStyle: "italic", lineHeight: 1.6 }}>
                  The ones that made it all worth it.
                </div>
              </div>
            </div>

            {/* Evidence polaroids */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start", marginBottom: "24px" }}>
              <Polaroid
                src="/best-beatbox.jpg"
                caption={"the beatboxing arc\n4 march 2026"}
                rotate={-2.5}
                accent="#ffd700"
                delay={0.1}
              />
              <Polaroid
                src="/best-salah.jpg"
                caption={"syncocrinzed Salah arc\nduring 26 Ramadan"}
                rotate={2}
                accent="#ffd700"
                delay={0.2}
              />
            </div>

            {/* Gold divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 20px" }}>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, #ffd70055)" }} />
              <span style={{ color: "#ffd70088", fontSize: "14px" }}>★</span>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, #ffd70055)" }} />
            </div>

            <div style={{ marginBottom: "4px", fontSize: "11px", color: "#ffd70066", letterSpacing: "0.15em" }}>· · · ✦ · · ·</div>
            <CloseBtn onClose={onClose} color="#ffd700" />

            <style>{`
              @keyframes crownBob {
                0%,100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
              }
            `}</style>
          </>
        )}

        {/* ── REGULAR CARDS ── */}
        {!isCustom && (
          <>
            <div style={{ fontSize: "64px", marginBottom: "16px", filter: "drop-shadow(0 0 20px rgba(255,200,100,0.4))" }}>
              {card.icon}
            </div>
            <div style={{ display: "inline-block", background: `${card.color}22`, border: `1px solid ${card.color}44`, borderRadius: "100px", padding: "4px 16px", fontSize: "11px", letterSpacing: "0.15em", color: card.color, marginBottom: "16px", textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>
              {card.description}
            </div>
            <h2 style={{ color: "#fff", fontSize: "28px", fontWeight: "700", margin: "0 0 20px", fontFamily: "system-ui, -apple-system, sans-serif", textShadow: `0 0 20px ${card.color}88` }}>
              {card.title}
            </h2>
            <p style={{ color: "rgba(200,210,255,0.85)", fontSize: "15px", lineHeight: "1.7", margin: "0 0 32px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
              {card.detail}
            </p>
            <button
              onClick={onClose}
              style={{ background: `linear-gradient(135deg, ${card.color}dd, ${card.glow}dd)`, color: "white", border: "none", borderRadius: "100px", padding: "12px 32px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "system-ui, sans-serif", letterSpacing: "0.05em", boxShadow: `0 4px 20px ${card.color}44`, transition: "transform 0.15s ease" }}
              onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "scale(1.05)"; }}
              onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              Back to Space
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes floatIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
