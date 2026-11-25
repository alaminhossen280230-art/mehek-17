import { useEffect, useRef, useState, useCallback } from "react";
import { CardData, CARDS } from "../App";

interface SolarSystemProps {
  onCardClick: (card: CardData) => void;
}

const RADIUS = 270;
const GOLDEN_ANGLE = 2.399963;
const NUM_CARDS = 6;

function goldenPos(i: number, n: number) {
  return {
    phi: Math.acos(1 - 2 * (i + 0.5) / n),
    theta: i * GOLDEN_ANGLE,
  };
}

const INITIAL = Array.from({ length: NUM_CARDS }, (_, i) => goldenPos(i, NUM_CARDS));

function spherePos(r: number, theta: number, phi: number) {
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta),
  };
}

export default function SolarSystem({ onCardClick }: SolarSystemProps) {
  const [visible, setVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // DOM refs — animation runs entirely through direct DOM updates
  const sceneRef = useRef<HTMLDivElement>(null);
  const sunBillboardRef = useRef<HTMLDivElement>(null);
  const outerRefs = useRef<(HTMLDivElement | null)[]>(Array(NUM_CARDS).fill(null));
  const innerRefs = useRef<(HTMLDivElement | null)[]>(Array(NUM_CARDS).fill(null));

  // Animation state in refs (no React state updates in loop)
  const thetasRef = useRef(INITIAL.map(p => p.theta));
  const phisRef = useRef(INITIAL.map(p => p.phi));
  const sceneRotRef = useRef({ x: -20, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const lastFrameRef = useRef(Date.now());
  const animRef = useRef<number>(0);
  const hoveredIdxRef = useRef<number | null>(null);
  const pressedIdxRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const dragRef = useRef<{
    pointerId: number;
    startX: number; startY: number;
    startRotX: number; startRotY: number;
    prevX: number; prevY: number; prevT: number;
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const speeds = Array.from({ length: NUM_CARDS }, () => 0.016 + Math.random() * 0.010);

    function animate() {
      const now = Date.now();
      const delta = Math.min((now - lastFrameRef.current) / 1000, 0.05);
      lastFrameRef.current = now;

      // Advance orbits
      for (let i = 0; i < NUM_CARDS; i++) {
        thetasRef.current[i] += speeds[i] * delta;
      }

      // Momentum when not dragging
      if (!dragRef.current) {
        velRef.current.x *= 0.88;
        velRef.current.y *= 0.88;
        const vx = velRef.current.x;
        const vy = velRef.current.y;
        if (Math.abs(vx) > 0.003 || Math.abs(vy) > 0.003) {
          sceneRotRef.current.x = Math.max(-80, Math.min(80, sceneRotRef.current.x + vx));
          sceneRotRef.current.y += vy;
        }
      }

      const { x: rx, y: ry } = sceneRotRef.current;

      // Update scene wrapper
      if (sceneRef.current) {
        sceneRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      }

      // Update sun billboard (counter-rotates to always face camera)
      if (sunBillboardRef.current) {
        sunBillboardRef.current.style.transform = `rotateY(${-ry}deg) rotateX(${-rx}deg)`;
      }

      // Calculate card positions
      const hovered = hoveredIdxRef.current;
      const pressed = pressedIdxRef.current;

      // First pass: get z values for sorting
      const zVals: number[] = Array(NUM_CARDS);
      for (let i = 0; i < NUM_CARDS; i++) {
        const { z } = spherePos(RADIUS, thetasRef.current[i], phisRef.current[i]);
        zVals[i] = z;
      }

      // Sort indices by z (back to front) for correct stacking
      const sortedIndices = Array.from({ length: NUM_CARDS }, (_, i) => i)
        .sort((a, b) => zVals[a] - zVals[b]);
      sortedIndices.forEach((cardIdx, sortRank) => {
        const outer = outerRefs.current[cardIdx];
        if (outer) outer.style.zIndex = String(sortRank * 10);
      });

      // Update each card transform
      for (let i = 0; i < NUM_CARDS; i++) {
        const { x, y, z } = spherePos(RADIUS, thetasRef.current[i], phisRef.current[i]);
        const depthT = (z + RADIUS) / (RADIUS * 2); // 0 = back, 1 = front

        // Scale: smooth depth curve — back 0.62, front 1.1
        const sc = 0.62 + depthT * 0.48;
        // Opacity: back stays visible (0.6), front fully opaque
        const opacity = 0.6 + depthT * 0.4;

        // Pressed = bright flash; hovered = slight glow; else normal
        let filterVal: string;
        if (pressed === i) {
          filterVal = "brightness(2.0) saturate(1.5)";
        } else if (hovered === i) {
          filterVal = "brightness(1.25) saturate(1.2)";
        } else {
          filterVal = "none";
        }

        // Scale boost for hovered/pressed
        const finalScale = pressed === i ? sc * 1.15 : hovered === i ? sc * 1.08 : sc;

        const outer = outerRefs.current[i];
        const inner = innerRefs.current[i];

        if (outer) {
          outer.style.transform = `translateX(${x}px) translateY(${-y}px) translateZ(${z}px)`;
        }
        if (inner) {
          inner.style.transform = `rotateY(${-ry}deg) rotateX(${-rx}deg) scale(${finalScale})`;
          inner.style.opacity = String(Math.round(opacity * 100) / 100);
          inner.style.filter = filterVal;
          // Always allow interaction — depthT just affects visual size
          inner.style.pointerEvents = "auto";
          inner.style.cursor = "pointer";
        }
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Pointer drag
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
      const sd = dragRef.current;
      const dx = e.clientX - sd.startX;
      const dy = e.clientY - sd.startY;
      sceneRotRef.current = {
        x: Math.max(-80, Math.min(80, sd.startRotX - dy * 0.35)),
        y: sd.startRotY + dx * 0.35,
      };
      const now = Date.now();
      const dt = Math.max(now - sd.prevT, 8);
      velRef.current.x = ((e.clientY - sd.prevY) / dt) * -14;
      velRef.current.y = ((e.clientX - sd.prevX) / dt) * 14;
      sd.prevX = e.clientX; sd.prevY = e.clientY; sd.prevT = now;
    };

    const onUp = (e: PointerEvent) => {
      if (dragRef.current?.pointerId === e.pointerId) {
        dragRef.current = null;
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    velRef.current = { x: 0, y: 0 };
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX, startY: e.clientY,
      startRotX: sceneRotRef.current.x,
      startRotY: sceneRotRef.current.y,
      prevX: e.clientX, prevY: e.clientY,
      prevT: Date.now(),
    };
    isDraggingRef.current = true;
    setIsDragging(true);
  }, []);

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: "1000px",
        perspectiveOrigin: "50% 48%",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.8s ease",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* Scene wrapper — transform updated directly by animation loop */}
      <div
        ref={sceneRef}
        style={{
          position: "relative",
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          transform: "rotateX(-20deg) rotateY(0deg)",
        }}
      >
        <BackgroundStars />

        {/* Sun — billboard wrapper updated by loop, content is static */}
        <div
          ref={sunBillboardRef}
          style={{ position: "absolute", width: 0, height: 0 }}
        >
          <SunContent />
        </div>

        {/* Cards — outer positions & inner scales updated directly by loop */}
        {CARDS.map((card, i) => {
          const isBest = card.id === "best-arcs";
          const isComingSoon = card.id.startsWith("coming-soon");
          const w = isBest ? 145 : 130;
          const h = isBest ? 190 : 175;

          return (
            <div
              key={card.id}
              ref={el => { outerRefs.current[i] = el; }}
              style={{
                position: "absolute",
                width: 0,
                height: 0,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                ref={el => { innerRefs.current[i] = el; }}
                onPointerDown={e => { e.stopPropagation(); pressedIdxRef.current = i; }}
                onPointerUp={() => { pressedIdxRef.current = null; }}
                onPointerCancel={() => { pressedIdxRef.current = null; hoveredIdxRef.current = null; }}
                onPointerEnter={() => { hoveredIdxRef.current = i; }}
                onPointerLeave={() => { hoveredIdxRef.current = null; pressedIdxRef.current = null; }}
                onClick={() => onCardClick(card)}
                style={{
                  position: "absolute",
                  width: w,
                  height: h,
                  marginLeft: -(w / 2),
                  marginTop: -(h / 2),
                  // transform & opacity controlled by animation loop
                  transform: "rotateY(0deg) rotateX(0deg) scale(0.7)",
                  opacity: 0.7,
                  background: isBest
                    ? "linear-gradient(145deg, #ffd70033, #ff990022, #ffd70011)"
                    : isComingSoon
                    ? `linear-gradient(145deg, ${card.color}28 0%, ${card.glow}1a 100%)`
                    : `linear-gradient(145deg, ${card.color}33 0%, ${card.glow}22 100%)`,
                  border: isBest
                    ? "1.5px solid transparent"
                    : isComingSoon
                    ? `1px dashed ${card.color}66`
                    : `1px solid ${card.color}77`,
                  borderRadius: "18px",
                  boxShadow: isBest
                    ? `0 0 24px #ffd70066, 0 0 60px #ff990033, inset 0 0 20px #ffd70011`
                    : isComingSoon
                    ? `0 0 10px ${card.color}33`
                    : `0 0 15px ${card.color}44, inset 0 0 10px ${card.color}11`,
                  backdropFilter: "blur(6px)",
                  userSelect: "none",
                  touchAction: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "16px 12px",
                  animation: isBest ? "bestGlow 2.5s ease-in-out infinite" : "none",
                  willChange: "transform, opacity",
                }}
              >
                {/* Rainbow border for Best card */}
                {isBest && (
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "18px",
                    padding: "1.5px",
                    background: "linear-gradient(135deg, #ffd700, #ff6eb4, #a78bfa, #60c8f5, #ffd700)",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor", maskComposite: "exclude",
                    animation: "rainbowSpin 3s linear infinite", pointerEvents: "none",
                  }} />
                )}
                {isBest && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "20px", filter: "drop-shadow(0 0 8px #ffd700aa)",
                    animation: "crownBob 1.8s ease-in-out infinite", pointerEvents: "none",
                  }}>👑</div>
                )}

                {isComingSoon ? (
                  <>
                    <div style={{
                      fontSize: "30px", lineHeight: 1,
                      filter: `drop-shadow(0 0 8px ${card.color}88)`,
                      animation: "floatIcon 2.5s ease-in-out infinite",
                    }}>{card.icon}</div>
                    <div style={{
                      color: `${card.color}dd`, fontSize: "11px", fontWeight: "700",
                      fontFamily: "system-ui, sans-serif", textAlign: "center",
                      letterSpacing: "0.1em", marginTop: "4px",
                      textShadow: `0 0 8px ${card.color}66`,
                    }}>COMING SOON</div>
                    <div style={{
                      fontSize: "16px", color: `${card.color}99`,
                      animation: "floatIcon 1.8s ease-in-out infinite",
                    }}>···</div>
                  </>
                ) : card.gif ? (
                  <img
                    src={card.gif} alt={card.title} draggable={false}
                    style={{
                      width: isBest ? "84px" : "72px",
                      height: isBest ? "84px" : "72px",
                      objectFit: "contain", borderRadius: "12px",
                      filter: isBest
                        ? "drop-shadow(0 0 14px #ffd700aa)"
                        : `drop-shadow(0 0 10px ${card.color}88)`,
                      pointerEvents: "none",
                    }}
                  />
                ) : (
                  <div style={{ fontSize: "32px", filter: `drop-shadow(0 0 12px ${card.color}99)` }}>
                    {card.icon}
                  </div>
                )}

                {!isComingSoon && (
                  <>
                    <div style={{
                      color: "#fff", fontSize: "13px", fontWeight: "900",
                      fontFamily: "system-ui, sans-serif", textAlign: "center",
                      textShadow: isBest ? "0 0 12px #ffd700, 0 0 24px #ff9900" : `0 0 10px ${card.color}`,
                      letterSpacing: "0.01em",
                    }}>{card.title}</div>
                    <div style={{
                      color: isBest ? "#ffd700aa" : `${card.color}cc`,
                      fontSize: "9px", fontFamily: "system-ui, sans-serif",
                      textAlign: "center", letterSpacing: "0.04em",
                    }}>{card.description}</div>
                    <div style={{
                      marginTop: "4px",
                      color: isBest ? "#ffd70088" : "rgba(180,200,255,0.5)",
                      fontSize: "9px", fontFamily: "system-ui, sans-serif", letterSpacing: "0.1em",
                    }}>{isBest ? "★ TAP ★" : "TAP TO EXPLORE"}</div>
                  </>
                )}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "18px",
                  background: `linear-gradient(135deg, ${isBest ? "#ffd70018" : card.color + "1a"} 0%, transparent 50%)`,
                  pointerEvents: "none",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes sunRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes sunPulseGlow { 0%,100% { opacity: 0.55; } 50% { opacity: 0.78; } }
        @keyframes coronaPulse { 0%,100% { opacity: 0.18; } 50% { opacity: 0.30; } }
        @keyframes bestGlow {
          0%,100% { box-shadow: 0 0 24px #ffd70066, 0 0 60px #ff990033, inset 0 0 20px #ffd70011; }
          50% { box-shadow: 0 0 40px #ffd700aa, 0 0 80px #ff990055, inset 0 0 30px #ffd70022; }
        }
        @keyframes rainbowSpin {
          0% { background: linear-gradient(0deg, #ffd700, #ff6eb4, #a78bfa, #60c8f5, #ffd700); }
          50% { background: linear-gradient(180deg, #ffd700, #ff6eb4, #a78bfa, #60c8f5, #ffd700); }
          100% { background: linear-gradient(360deg, #ffd700, #ff6eb4, #a78bfa, #60c8f5, #ffd700); }
        }
        @keyframes crownBob {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-4px); }
        }
        @keyframes floatIcon {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

function SunContent() {
  return (
    <>
      <div style={{
        position: "absolute", width: 320, height: 320, borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(255,140,0,0.22) 0%, rgba(255,80,0,0.10) 50%, transparent 72%)",
        animation: "coronaPulse 5s ease-in-out infinite", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 210, height: 210, borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(255,200,60,0.40) 0%, rgba(255,120,0,0.24) 45%, transparent 70%)",
        animation: "sunPulseGlow 3.5s ease-in-out infinite", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: 140, height: 140, borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle at 36% 32%, #fff9e0 0%, #ffe566 8%, #ffcc00 20%, #ff9900 38%, #ff6600 58%, #cc3300 78%, #881100 100%)",
        boxShadow: "0 0 30px 12px rgba(255,180,40,0.65), 0 0 70px 30px rgba(255,100,0,0.35)",
        pointerEvents: "none", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", width: "48%", height: "42%", top: "8%", left: "14%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,230,0.75) 0%, transparent 100%)",
          filter: "blur(6px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "repeating-conic-gradient(rgba(255,180,0,0.10) 0deg, transparent 4deg, rgba(255,140,0,0.06) 8deg)",
          animation: "sunRotate 40s linear infinite", mixBlendMode: "overlay", pointerEvents: "none",
        }} />
      </div>
    </>
  );
}

function BackgroundStars() {
  const stars = useRef(
    Array.from({ length: 200 }, () => ({
      x: (Math.random() - 0.5) * 1800,
      y: (Math.random() - 0.5) * 1200,
      z: -350 - Math.random() * 200,
      size: 0.5 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.7,
    }))
  );
  return (
    <>
      {stars.current.map((s, i) => (
        <div key={i} style={{
          position: "absolute", width: s.size, height: s.size, borderRadius: "50%",
          background: "white",
          transform: `translate(${s.x}px, ${s.y}px) translateZ(${s.z}px)`,
          opacity: s.opacity, pointerEvents: "none",
        }} />
      ))}
    </>
  );
}
