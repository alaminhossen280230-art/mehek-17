import { useState, useEffect, useRef } from "react";

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes fallDown {
    0%   { transform: translateY(-60px) translateX(0)               rotate(0deg);   opacity: 1; }
    100% { transform: translateY(110vh) translateX(var(--p-drift))  rotate(400deg); opacity: 0.4; }
  }
  @keyframes giftFall {
    0%   { transform: translateY(-60px) rotate(0deg);   opacity: 1; }
    85%  { opacity: 1; }
    100% { transform: translateY(110vh) rotate(var(--g-rot)); opacity: 0; }
  }
  @keyframes flameWave { 0%,100% { d: path("M9,34 C9,34 0,22 4,12 C6,6 9,0 9,0 C9,0 18,6 14,18 C11,26 9,34 9,34 Z"); } 50% { d: path("M9,34 C9,34 1,20 5,10 C8,4 9,0 9,0 C9,0 17,7 13,19 C10,27 9,34 9,34 Z"); } }
  @keyframes flameFlicker { 0%,100% { opacity: 1; transform: scaleX(1); } 50% { opacity: 0.92; transform: scaleX(0.93); } }
  @keyframes wishPop { 0% { opacity: 0; transform: scale(0.6) translateY(20px); } 70% { transform: scale(1.07) translateY(-3px); opacity:1; } 100% { opacity: 1; transform: scale(1); } }
  @keyframes bearSlide { 0% { opacity: 0; transform: scaleX(-1) translateX(-50px); } 100% { opacity: 1; transform: scaleX(-1) translateX(0); } }
  @keyframes catPop { 0% { opacity:0; transform: scale(0.5) translateX(30px); } 100% { opacity:1; transform: scale(1) translateX(0); } }
  @keyframes creditsScroll { 0% { transform: translateY(0); } 100% { transform: translateY(-100%); } }
  @keyframes creditsGlow { 0%,100% { text-shadow: 0 0 28px #ff64b4, 0 0 60px #ff3096aa; } 50% { text-shadow: 0 0 48px #ff96d0, 0 0 100px #ff64b4; } }
  @keyframes creditsFade { 0% { opacity:0; } 100% { opacity:1; } }
  @keyframes cakeFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes pulseBtn { 0%,100% { box-shadow: 0 4px 20px #c0405a66, 0 0 0 0 #e8607a44; } 50% { box-shadow: 0 4px 28px #c0405a99, 0 0 0 8px #e8607a00; } }
`;

// ── Confetti ──────────────────────────────────────────────────────────────────
interface P { id:number; x:number; size:number; color:string; rect:boolean; dur:number; delay:number; drift:number }
const PC = ["#fff","#fff","#ffd6e7","#c8a8e0","#ffd700","#b8e0ff","#ffb3cc"];
function makeP(): P[] {
  return Array.from({length:55}, (_,i) => ({
    id: i, x: Math.random()*100,
    size: i%3===0 ? 9+Math.random()*9 : 5+Math.random()*7,
    color: PC[Math.floor(Math.random()*PC.length)],
    rect: i%4===0,
    dur: 5+Math.random()*7, delay: Math.random()*8,
    drift: (Math.random()-0.5)*50,
  }));
}

// ── Flame (SVG, reacts to blow via ref) ──────────────────────────────────────
function Flame({ blowRef }: { blowRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<SVGGElement>(null);
  const glowRef  = useRef<SVGEllipseElement>(null);

  useEffect(() => {
    let raf: number;
    function loop() {
      const b = blowRef.current;
      if (groupRef.current && glowRef.current) {
        const lean    = b * 36;
        const stretchY = 1 + b * 0.7;
        const squishX  = 1 - b * 0.3;
        groupRef.current.setAttribute("transform", `rotate(${lean},9,34) scale(${squishX},${stretchY})`);
        groupRef.current.style.transformOrigin = "9px 34px";
        const gs = 12 + b * 14;
        glowRef.current.setAttribute("rx", String(gs));
        glowRef.current.setAttribute("ry", String(gs * 0.6));
        glowRef.current.style.opacity = String(0.5 + b * 0.45);
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [blowRef]);

  return (
    <svg width="40" height="52" viewBox="0 0 18 36" style={{ display: "block", overflow: "visible" }}>
      {/* Glow */}
      <ellipse ref={glowRef} cx="9" cy="34" rx="12" ry="7"
        fill="rgba(255,200,60,0.45)" style={{ transition: "none", filter: "blur(4px)" }} />
      <g ref={groupRef} style={{ transformOrigin: "9px 34px", animation: "flameFlicker 0.25s ease-in-out infinite" }}>
        {/* Outer flame */}
        <ellipse cx="9" cy="17" rx="8" ry="17"
          fill="url(#fg1)" style={{ filter: "url(#blur1)" }} />
        {/* Inner bright */}
        <ellipse cx="9" cy="20" rx="4.5" ry="11"
          fill="url(#fg2)" />
        {/* Tip */}
        <ellipse cx="9" cy="8" rx="2.5" ry="5"
          fill="rgba(255,255,230,0.9)" />
      </g>
      <defs>
        <radialGradient id="fg1" cx="50%" cy="80%" r="60%">
          <stop offset="0%"   stopColor="#ff8800" />
          <stop offset="40%"  stopColor="#ffcc00" />
          <stop offset="80%"  stopColor="#ffe566" />
          <stop offset="100%" stopColor="rgba(255,240,100,0)" />
        </radialGradient>
        <radialGradient id="fg2" cx="50%" cy="80%" r="60%">
          <stop offset="0%"  stopColor="#fff8e0" />
          <stop offset="60%" stopColor="#ffe566" />
          <stop offset="100%" stopColor="rgba(255,200,0,0)" />
        </radialGradient>
        <filter id="blur1"><feGaussianBlur stdDeviation="0.4"/></filter>
      </defs>
    </svg>
  );
}

// ── Fireworks canvas ──────────────────────────────────────────────────────────
function Fireworks() {
  const cvs = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = cvs.current!;
    const ctx = c.getContext("2d")!;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    type Sp = { x:number;y:number;vx:number;vy:number;a:number;col:string;r:number };
    const COLS = ["#ff6eb4","#ffd700","#a78bfa","#60c8f5","#ff8c69","#7fff7f","#ff4"];
    const sparks: Sp[] = []; const rockets: {x:number;y:number;vy:number;col:string;done:boolean}[] = [];
    const launch = () => rockets.push({x:60+Math.random()*(c.width-120), y:c.height, vy:-(c.height*0.012+Math.random()*c.height*0.007), col:COLS[Math.floor(Math.random()*COLS.length)], done:false});
    const explode = (rx:number,ry:number,col:string) => {
      for (let i=0;i<80;i++) { const a=(Math.PI*2*i)/80; const s=1.5+Math.random()*3.5; sparks.push({x:rx,y:ry,vx:Math.cos(a)*s,vy:Math.sin(a)*s,a:1,col,r:1.5+Math.random()*2}); }
    };
    let timer=0; let raf:number;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      ctx.fillStyle="rgba(240,160,181,0.15)"; ctx.fillRect(0,0,c.width,c.height);
      if(++timer%28===0) launch();
      rockets.forEach((r,i)=>{ r.y+=r.vy; r.vy+=0.06;
        ctx.save(); ctx.globalAlpha=0.9; ctx.shadowBlur=8; ctx.shadowColor=r.col;
        ctx.fillStyle=r.col; ctx.beginPath(); ctx.arc(r.x,r.y,3,0,Math.PI*2); ctx.fill(); ctx.restore();
        if(r.vy>=-2&&!r.done){ r.done=true; explode(r.x,r.y,r.col); rockets.splice(i,1); }
      });
      for(let i=sparks.length-1;i>=0;i--){ const s=sparks[i]; s.x+=s.vx; s.y+=s.vy; s.vy+=0.055; s.vx*=0.97; s.a-=0.016;
        if(s.a<=0){sparks.splice(i,1);continue;}
        ctx.save(); ctx.globalAlpha=s.a; ctx.shadowBlur=6; ctx.shadowColor=s.col; ctx.fillStyle=s.col;
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",resize); };
  }, []);
  return <canvas ref={cvs} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:30}} />;
}

// ── Falling gifts ─────────────────────────────────────────────────────────────
const GC=[{b:"#ff6b6b",r:"#fff"},{b:"#60c8f5",r:"#ffd700"},{b:"#7de87d",r:"#ff69b4"},{b:"#ffd700",r:"#c0405a"},{b:"#c084fc",r:"#fff"}];
function FallingGifts() {
  const gifts = useRef(Array.from({length:14},(_,i)=>({ id:i, x:42+Math.random()*52, sz:18+Math.random()*16, c:GC[i%GC.length], dur:2+Math.random()*2, delay:Math.random()*2.5, rot:(Math.random()-0.5)*540 }))).current;
  return <>{gifts.map(g=>(
    <div key={g.id} style={{position:"fixed",left:`${g.x}%`,top:"-60px",zIndex:28,pointerEvents:"none",
      animation:`giftFall ${g.dur}s ${g.delay}s ease-in infinite`,
      "--g-rot":`${g.rot}deg`} as React.CSSProperties}>
      <div style={{width:g.sz,height:g.sz,background:g.c.b,borderRadius:3,position:"relative",boxShadow:"0 2px 6px rgba(0,0,0,0.22)"}}>
        <div style={{position:"absolute",top:0,bottom:0,left:"50%",width:g.sz*0.18,transform:"translateX(-50%)",background:g.c.r}}/>
        <div style={{position:"absolute",left:0,right:0,top:"50%",height:g.sz*0.18,transform:"translateY(-50%)",background:g.c.r}}/>
        <div style={{position:"absolute",top:-g.sz*0.18,left:"50%",marginLeft:-g.sz*0.24,width:g.sz*0.24,height:g.sz*0.22,background:g.c.r,borderRadius:"50% 0 0 50%"}}/>
        <div style={{position:"absolute",top:-g.sz*0.18,left:"50%",width:g.sz*0.24,height:g.sz*0.22,background:g.c.r,borderRadius:"0 50% 50% 0"}}/>
      </div>
    </div>
  ))}</>;
}

// ── Typing text ───────────────────────────────────────────────────────────────
function TypingText({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  const [cur, setCur] = useState(true);
  const i = useRef(0);
  useEffect(() => {
    const t = setInterval(() => { if(i.current<text.length){ setShown(text.slice(0,i.current+1)); i.current++; } else clearInterval(t); }, 68);
    return ()=>clearInterval(t);
  }, [text]);
  useEffect(()=>{ const t=setInterval(()=>setCur(v=>!v),530); return()=>clearInterval(t); },[]);
  return <span>{shown}<span style={{opacity:cur?1:0}}>|</span></span>;
}

// ── End credits ───────────────────────────────────────────────────────────────
const CL = [
  {t:"title", s:"THE END"},
  {t:"gap"},{t:"role",s:"Directed by"},{t:"name",s:"Alif"},
  {t:"gap"},{t:"role",s:"Designed by"},{t:"name",s:"Replit AI"},
  {t:"gap"},{t:"role",s:"Assisted by"},{t:"name",s:"ChatGPT"},
  {t:"gap"},{t:"role",s:"Produced by"},{t:"name",s:"Alif"},
  {t:"gap"},{t:"role",s:"Concept & Idea by"},{t:"name",s:"Alif"},
  {t:"gap"},{t:"role",s:"Built by"},{t:"name",s:"Replit AI"},
  {t:"gap"},{t:"role",s:"Special Contribution"},{t:"name",s:"Tinni"},
  {t:"gap"},{t:"div",s:"—"},{t:"gap"},
  {t:"sticker", src:"/sticker-hamster.gif", left:true},
  {t:"msg",s:"....um so thank you for listening to my marka wala Kotha batra this year and can't wait to see the '17' mehek! But regardless of any changes let's never change the way we are!"},
  {t:"gap"},
  {t:"sticker", src:"/sticker-kirby.webp", left:false},
  {t:"div",s:"—"},{t:"gap"},{t:"gap"},
  {t:"final",s:"HAPPY BIRTHDAY"},
  {t:"gap"},
  {t:"sticker", src:"/sticker-kirby-warp.gif", left:true},
  {t:"gap"},{t:"gap"},
];

function EndCredits() {
  return (
    <div style={{position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.80)",overflow:"hidden",display:"flex",justifyContent:"center",animation:"creditsFade 1.5s ease both"}}>
      <div style={{width:"100%",maxWidth:420,paddingTop:"100vh",paddingBottom:"50vh",display:"flex",flexDirection:"column",alignItems:"center",animation:"creditsScroll 44s linear forwards"}}>
        {CL.map((line,i) => {
          if(line.t==="gap") return <div key={i} style={{height:22}}/>;
          if(line.t==="div") return <div key={i} style={{color:"rgba(255,255,255,0.35)",fontSize:26,margin:"2px 0",fontFamily:"Georgia,serif"}}>{line.s}</div>;
          if(line.t==="title") return <div key={i} style={{color:"#fff",fontSize:"clamp(38px,10vw,54px)",fontFamily:"Georgia,serif",fontWeight:700,letterSpacing:"0.18em",textAlign:"center",textShadow:"0 0 24px rgba(255,180,220,0.9),0 0 60px rgba(255,100,180,0.5)",marginBottom:6}}>{line.s}</div>;
          if(line.t==="role") return <div key={i} style={{color:"rgba(255,200,220,0.7)",fontSize:"clamp(10px,2.8vw,13px)",fontFamily:"system-ui,sans-serif",letterSpacing:"0.16em",textTransform:"uppercase",textAlign:"center",marginBottom:3}}>{line.s}</div>;
          if(line.t==="name") return <div key={i} style={{color:"#fff",fontSize:"clamp(18px,5.5vw,27px)",fontFamily:"Georgia,serif",fontWeight:700,textAlign:"center",marginBottom:2,textShadow:"0 0 10px rgba(255,160,200,0.55)"}}>{line.s}</div>;
          if(line.t==="msg") return <div key={i} style={{color:"rgba(255,235,245,0.92)",fontSize:"clamp(14px,4vw,18px)",fontFamily:"Georgia,serif",fontStyle:"italic",textAlign:"center",lineHeight:1.75,padding:"0 30px",textShadow:"0 1px 5px rgba(0,0,0,0.4)"}}>{line.s}</div>;
          if(line.t==="final") return <div key={i} style={{color:"#ffcce6",fontSize:"clamp(28px,9vw,46px)",fontFamily:"Georgia,serif",fontWeight:700,letterSpacing:"0.1em",textAlign:"center",animation:"creditsGlow 2s ease-in-out infinite"}}>{line.s}</div>;
          if(line.t==="sticker") return (
            <div key={i} style={{width:"100%",height:70,position:"relative",pointerEvents:"none"}}>
              <img src={(line as {src:string}).src} alt="" style={{position:"absolute", [(line as {left:boolean}).left?"left":"right"]: `${8+i%22}%`, top:4, width:52+(i%3)*8, imageRendering:"pixelated", opacity:0.88, filter:"drop-shadow(0 0 5px rgba(255,180,220,0.55))"}} />
            </div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function BirthdayPage() {
  const [blown,      setBlown]      = useState(false);
  const [micActive,  setMicActive]  = useState(false);
  const [micError,   setMicError]   = useState("");
  const [showWish,   setShowWish]   = useState(false);
  const [showCreds,  setShowCreds]  = useState(false);
  const [particles]                 = useState(makeP);

  const blowRef    = useRef(0);
  const audioRef   = useRef<AudioContext | null>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const analyRef   = useRef<AnalyserNode | null>(null);
  const rafRef     = useRef<number>(0);
  const barRef     = useRef<HTMLDivElement>(null);
  const lblRef     = useRef<HTMLDivElement>(null);

  const blowOut = () => {
    setBlown(true);
    streamRef.current?.getTracks().forEach(t=>t.stop());
    setMicActive(false);
    cancelAnimationFrame(rafRef.current);
    doBlowSound();
    setTimeout(()=>setShowWish(true),900);
    setTimeout(()=>setShowCreds(true),6000);
  };

  function doBlowSound() {
    const ctx = new (window.AudioContext||(window as any).webkitAudioContext)();
    audioRef.current = ctx;
    const buf=ctx.createBuffer(1,ctx.sampleRate*0.5,ctx.sampleRate);
    const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length);
    const src=ctx.createBufferSource(); src.buffer=buf;
    const f=ctx.createBiquadFilter(); f.type="bandpass"; f.frequency.value=600;
    const g=ctx.createGain(); g.gain.setValueAtTime(0.18,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);
    src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
    setTimeout(()=>doHappyBirthday(ctx),700);
  }

  function doHappyBirthday(ctx: AudioContext) {
    const t=ctx.currentTime;
    const notes: [number,number][] = [
      [261.6,.25],[261.6,.25],[293.7,.5],[261.6,.5],[349.2,.5],[329.6,1],
      [261.6,.25],[261.6,.25],[293.7,.5],[261.6,.5],[392,.5],[349.2,1],
      [261.6,.25],[261.6,.25],[523.3,.5],[440,.5],[349.2,.5],[329.6,.5],[293.7,1],
      [466.2,.25],[466.2,.25],[440,.5],[349.2,.5],[392,.5],[349.2,1.5],
    ];
    let e=0; notes.forEach(([freq,dur])=>{
      const o=ctx.createOscillator(); const g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.frequency.value=freq; o.type="triangle";
      g.gain.setValueAtTime(0,t+e); g.gain.linearRampToValueAtTime(0.1,t+e+0.03); g.gain.exponentialRampToValueAtTime(0.001,t+e+dur*0.8);
      o.start(t+e); o.stop(t+e+dur); e+=dur*0.5;
    });
  }

  const startMic = async () => {
    try {
      const ctx = new (window.AudioContext||(window as any).webkitAudioContext)();
      audioRef.current = ctx;
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      streamRef.current = stream;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser(); an.fftSize=256;
      src.connect(an); analyRef.current=an;
      setMicActive(true); setMicError("");
      const data = new Uint8Array(an.frequencyBinCount);
      let frames=0;
      function loop() {
        if(!analyRef.current) return;
        analyRef.current.getByteFrequencyData(data);
        const avg=data.reduce((a,b)=>a+b,0)/data.length;
        const intensity=Math.min(1,avg/78);
        blowRef.current = intensity>0.28 ? intensity : Math.max(0,blowRef.current-0.06);
        if(barRef.current){ barRef.current.style.width=`${Math.round(intensity*100)}%`; barRef.current.style.background=intensity>0.75?"linear-gradient(90deg,#4ade80,#22c55e)":intensity>0.4?"linear-gradient(90deg,#ffd700,#fb923c)":"linear-gradient(90deg,#f9a8d4,#ec4899)"; }
        if(lblRef.current) lblRef.current.textContent=intensity>0.7?"💨 Keep going!":intensity>0.35?"🎤 Blowing…":"🎤 Blow harder!";
        if(avg>78){ frames++; if(frames>=8){blowOut();return;} } else frames=Math.max(0,frames-1);
        rafRef.current=requestAnimationFrame(loop);
      }
      rafRef.current=requestAnimationFrame(loop);
    } catch { setMicError("Mic denied — tap below to blow!"); }
  };

  useEffect(()=>()=>{ cancelAnimationFrame(rafRef.current); streamRef.current?.getTracks().forEach(t=>t.stop()); audioRef.current?.close(); },[]);

  const CAKE_DOT_COLORS = ["#ff85c2","#ffd700","#c084fc","#60c8f5"];

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "linear-gradient(160deg,#f7b8cc 0%,#f0a0b5 45%,#e890aa 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      fontFamily: "Georgia,'Times New Roman',serif",
    }}>
      <style>{CSS}</style>

      {/* Confetti */}
      {particles.map(p=>(
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:0,
          width: p.rect?p.size*0.5:p.size,
          height: p.rect?p.size*1.6:p.size,
          borderRadius: p.rect?"2px":"50%",
          background: p.color, opacity:0.78,
          animation:`fallDown ${p.dur}s ${p.delay}s linear infinite`,
          "--p-drift":`${p.drift}px`,
          pointerEvents:"none", zIndex:1,
        } as React.CSSProperties}/>
      ))}

      {/* Bear GIF — left, faces right toward cake */}
      {!blown && (
        <img src="/bear-blow.gif" alt="" style={{
          position:"fixed", left:"1%", top:"14%",
          width:"clamp(90px,25vw,130px)",
          transform:"scaleX(-1)",
          animation:"bearSlide 0.6s ease-out both",
          zIndex:15, pointerEvents:"none",
        }}/>
      )}

      {/* Cat GIF — right, appears after blow */}
      {blown && (
        <img src="/cat-gifts.gif" alt="" style={{
          position:"fixed", right:"2%", top:"34%",
          width:"clamp(80px,22vw,120px)",
          animation:"catPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
          zIndex:25, pointerEvents:"none",
        }}/>
      )}

      {blown && <FallingGifts/>}
      {blown && <Fireworks/>}

      {/* ── Main visible content ── */}
      <div style={{
        position:"relative", zIndex:10,
        display:"flex", flexDirection:"column",
        alignItems:"center",
        animation:"cakeFloat 3.5s ease-in-out infinite",
      }}>

        {/* Flame → candle → cake in one flex column */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>

          {/* Flame container (or smoke after blow) */}
          <div style={{
            width:40, height:52,
            display:"flex", alignItems:"flex-end", justifyContent:"center",
            marginBottom: -2,
            cursor: blown||micActive?"default":"pointer",
          }} onClick={()=>!blown&&!micActive&&blowOut()}>
            {!blown
              ? <Flame blowRef={blowRef}/>
              : <div style={{width:3,height:22,background:"linear-gradient(180deg,rgba(140,120,120,0.55) 0%,transparent 100%)",borderRadius:3}}/>
            }
          </div>

          {/* Candle */}
          <div style={{
            width:20, height:70,
            background:"linear-gradient(180deg,#fdf0f5 0%,#ead0dc 45%,#ceb0c0 100%)",
            borderRadius:"4px 4px 2px 2px",
            position:"relative",
            boxShadow:"inset -3px 0 5px rgba(0,0,0,0.1),inset 2px 0 4px rgba(255,255,255,0.5)",
          }}>
            <div style={{position:"absolute",top:"28%",left:0,right:0,height:3,background:"rgba(200,150,175,0.5)",borderRadius:2}}/>
            <div style={{position:"absolute",top:"58%",left:0,right:0,height:3,background:"rgba(200,150,175,0.5)",borderRadius:2}}/>
          </div>

          {/* Frosting top */}
          <div style={{width:140,height:13,background:"linear-gradient(180deg,#fff 55%,#fceef5 100%)",borderRadius:"2px 2px 0 0",position:"relative",zIndex:2}}>
            {[12,32,52,72,92,112].map((x,i)=>(
              <div key={i} style={{position:"absolute",top:9,left:x,width:9,height:10+(i%2)*5,background:"#fff",borderRadius:"0 0 6px 6px"}}/>
            ))}
          </div>

          {/* Top layer */}
          <div style={{width:140,height:36,background:"linear-gradient(180deg,#5c3a2e,#3d2416)",position:"relative",zIndex:1}}>
            <div style={{position:"absolute",top:"38%",left:0,right:0,height:3,background:"rgba(255,255,255,0.12)"}}/>
          </div>

          {/* Mid frosting */}
          <div style={{width:154,height:10,background:"#fff",position:"relative",zIndex:2}}>
            {[8,30,54,78,104,128].map((x,i)=>(
              <div key={i} style={{position:"absolute",top:8,left:x,width:9,height:8+(i%3)*4,background:"#fff",borderRadius:"0 0 5px 5px"}}/>
            ))}
          </div>

          {/* Bottom layer */}
          <div style={{width:154,height:44,background:"linear-gradient(180deg,#5c3a2e,#3d2416)",position:"relative",zIndex:1}}>
            <div style={{position:"absolute",top:"42%",left:0,right:0,height:3,background:"rgba(255,255,255,0.1)"}}/>
            {[14,44,76,108].map((x,i)=>(
              <div key={i} style={{position:"absolute",top:"50%",left:x,width:9,height:9,borderRadius:"50%",
                background:CAKE_DOT_COLORS[i],transform:"translateY(-50%)",
                boxShadow:`0 0 6px ${CAKE_DOT_COLORS[i]}`}}/>
            ))}
          </div>

          {/* Plate */}
          <div style={{width:182,height:13,background:"linear-gradient(180deg,#f0f0f0,#ddd)",
            borderRadius:"0 0 50% 50%/0 0 100% 100%",
            boxShadow:"0 5px 14px rgba(0,0,0,0.18)"}}/>
        </div>

        {/* Controls */}
        <div style={{marginTop:18,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          {!blown && (
            <>
              {micActive && (
                <>
                  <div ref={lblRef} style={{color:"#7a1840",fontSize:13,fontFamily:"system-ui",fontWeight:700,letterSpacing:"0.05em"}}>🎤 Blow!</div>
                  <div style={{width:150,height:9,background:"rgba(255,255,255,0.45)",borderRadius:5,overflow:"hidden",border:"1px solid rgba(180,100,130,0.25)"}}>
                    <div ref={barRef} style={{width:"0%",height:"100%",borderRadius:5,background:"linear-gradient(90deg,#f9a8d4,#ec4899)",transition:"width 0.05s linear"}}/>
                  </div>
                </>
              )}
              {!micActive && !micError && (
                <button onClick={startMic} style={{
                  background:"linear-gradient(135deg,#e8607a,#c0405a)",
                  border:"none",borderRadius:"50px",padding:"12px 32px",
                  color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",
                  fontFamily:"system-ui",letterSpacing:"0.03em",
                  animation:"pulseBtn 2s ease-in-out infinite",
                  boxShadow:"0 4px 20px rgba(180,50,90,0.4)",
                }}>🎤 Blow the candle!</button>
              )}
              {micError && (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{color:"#7a1840",fontSize:12,fontFamily:"system-ui",textAlign:"center"}}>{micError}</div>
                  <button onClick={blowOut} style={{
                    background:"linear-gradient(135deg,#e8607a,#c0405a)",
                    border:"none",borderRadius:"50px",padding:"12px 28px",
                    color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"system-ui",
                    boxShadow:"0 4px 18px rgba(180,50,90,0.38)",
                  }}>💨 Tap to Blow!</button>
                </div>
              )}
            </>
          )}
          {blown && showWish && (
            <div style={{
              fontSize:"clamp(15px,4.5vw,20px)",color:"#fff",fontFamily:"system-ui,sans-serif",
              fontWeight:700,letterSpacing:"0.04em",
              animation:"wishPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both",
              textShadow:"0 0 16px rgba(255,100,180,0.9),0 2px 8px rgba(140,30,80,0.6)",
            }}>🎉 Make a Wish! 🎉</div>
          )}
        </div>
      </div>

      {/* Bottom text */}
      <div style={{position:"fixed",bottom:28,left:0,right:0,textAlign:"center",zIndex:12,pointerEvents:"none"}}>
        <div style={{
          fontSize:"clamp(22px,7vw,34px)",fontWeight:700,
          color:"#7a1840",fontStyle:"italic",letterSpacing:"0.01em",lineHeight:1.2,
          textShadow:"0 2px 14px rgba(255,220,235,0.85)",
        }}>
          {!showWish
            ? <TypingText text="Happy Birthday Mehek Wali!"/>
            : <span style={{animation:"wishPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both",display:"inline-block"}}>Happy Birthday Mehek Wali! 🌸</span>
          }
        </div>
      </div>

      {/* End credits */}
      {showCreds && <EndCredits/>}
    </div>
  );
}
