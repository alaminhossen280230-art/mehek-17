import { useEffect, useRef } from "react";
import { Phase } from "../App";

interface AmbientMusicProps {
  phase: Phase;
}

export default function AmbientMusic({ phase }: AmbientMusicProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<AudioNode[]>([]);
  const startedRef = useRef(false);

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  }

  function stopAll() {
    nodesRef.current.forEach(n => {
      try { (n as OscillatorNode).stop?.(); } catch {}
    });
    nodesRef.current = [];
  }

  function startSpaceAmbient() {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);
    master.connect(ctx.destination);
    gainRef.current = master;

    const freqs = [55, 82.4, 110, 164.8, 220];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.05 + i * 0.02, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(freq * 0.003, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.18 - i * 0.02, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400 + i * 80, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      filter.connect(master);

      osc.start();
      lfo.start();
      nodesRef.current.push(osc, lfo);
    });
  }

  function startOrbitAmbient() {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2);
    master.connect(ctx.destination);
    gainRef.current = master;

    const freqs = [220, 277.2, 329.6, 440, 554.4];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1 + i * 0.05, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(freq * 0.002, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.12 - i * 0.015, ctx.currentTime);

      const reverb = ctx.createDelay(0.5);
      reverb.delayTime.setValueAtTime(0.3, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(reverb);
      reverb.connect(master);
      oscGain.connect(master);

      osc.start();
      lfo.start();
      nodesRef.current.push(osc, lfo);
    });
  }

  useEffect(() => {
    if (phase === "warp" || phase === "arriving") {
      if (!startedRef.current) {
        startedRef.current = true;
        startSpaceAmbient();
      }
    } else if (phase === "orbit") {
      stopAll();
      if (gainRef.current) {
        const ctx = getCtx();
        gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
        setTimeout(() => {
          stopAll();
          startOrbitAmbient();
        }, 1600);
      } else {
        startOrbitAmbient();
      }
    }
  }, [phase]);

  useEffect(() => {
    return () => { stopAll(); ctxRef.current?.close(); };
  }, []);

  return null;
}
