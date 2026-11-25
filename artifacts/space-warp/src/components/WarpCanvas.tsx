import { useEffect, useRef } from "react";
import { Phase } from "../App";

interface WarpCanvasProps {
  active: boolean;
  phase: Phase;
  onWarpComplete: () => void;
  onArrived: () => void;
}

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
}

const NUM_STARS = 600;
const WARP_DURATION = 2200;
const ARRIVE_DURATION = 1000;

export default function WarpCanvas({ active, phase, onWarpComplete, onArrived }: WarpCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const frameRef = useRef<number>(0);
  const phaseRef = useRef(phase);
  const warpStartRef = useRef(Date.now());
  const arriveStartRef = useRef(0);
  const arrivedRef = useRef(false);
  const opacityRef = useRef(1);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "arriving") {
      arriveStartRef.current = Date.now();
    }
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    function initStar(star: Star, canvas: HTMLCanvasElement) {
      star.x = (Math.random() - 0.5) * canvas.width * 2;
      star.y = (Math.random() - 0.5) * canvas.height * 2;
      star.z = Math.random() * canvas.width;
      star.pz = star.z;
    }

    starsRef.current = Array.from({ length: NUM_STARS }, () => {
      const s: Star = { x: 0, y: 0, z: 0, pz: 0 };
      initStar(s, canvas);
      return s;
    });

    warpStartRef.current = Date.now();

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const now = Date.now();
      const p = phaseRef.current;

      let speed = 0;
      let opacity = 1;

      if (p === "warp") {
        const elapsed = now - warpStartRef.current;
        speed = 25;
        opacity = 1;
        if (elapsed > WARP_DURATION) {
          onWarpComplete();
        }
      } else if (p === "arriving") {
        const elapsed = now - arriveStartRef.current;
        const t = Math.min(elapsed / ARRIVE_DURATION, 1);
        speed = 25 * (1 - t) * (1 - t);
        opacity = 1 - t;
        opacityRef.current = opacity;
        if (t >= 1 && !arrivedRef.current) {
          arrivedRef.current = true;
          onArrived();
        }
      }

      ctx.fillStyle = `rgba(0, 0, 16, 0.25)`;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = opacity;

      for (const star of starsRef.current) {
        star.pz = star.z;
        star.z -= speed;
        if (star.z <= 0) {
          initStar(star, canvas);
          continue;
        }

        const sx = (star.x / star.z) * w + cx;
        const sy = (star.y / star.z) * h + cy;
        const px = (star.x / star.pz) * w + cx;
        const py = (star.y / star.pz) * h + cy;

        const size = Math.max(0.5, (1 - star.z / w) * 3.5);
        const brightness = Math.floor(180 + (1 - star.z / w) * 75);
        const blue = Math.floor(220 + (1 - star.z / w) * 35);

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = `rgb(${brightness}, ${brightness + 10}, ${blue})`;
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      ctx.restore();

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [onWarpComplete, onArrived]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 10,
        pointerEvents: "none",
      }}
    />
  );
}
