import { useState, useRef, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Lato:wght@300;400;700&family=Dancing+Script:wght@700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Lato', sans-serif; background: #1a0a14; min-height: 100vh; overflow-x: hidden; }

  :root {
    --rose: #f25c8a; --deep: #c2185b; --blush: #fce4ec;
    --gold: #ffb347; --dark: #1a0a14;
    --card-bg: rgba(255,255,255,0.06);
    --card-border: rgba(242,92,138,0.25);
  }

  /* ── Site Title ── */
  .site-title {
    font-family: 'Dancing Script', cursive;
    font-size: clamp(1.8rem, 6vw, 2.8rem);
    text-align: center; margin-bottom: 1.4rem;
    background: linear-gradient(135deg, #ffb347 0%, #f25c8a 50%, #fce4ec 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    filter: drop-shadow(0 2px 14px rgba(242,92,138,.55));
    letter-spacing: .02em; line-height: 1.2;
  }

  /* ── Floating Hearts ── */
  @keyframes floatHeart {
    0%   { transform: translateY(0) scale(1) rotate(0deg); opacity:.8; }
    50%  { opacity:.5; }
    100% { transform: translateY(-110vh) scale(.4) rotate(25deg); opacity:0; }
  }
  .heart-particle { position: fixed; pointer-events: none; animation: floatHeart linear infinite; z-index: 0; user-select: none; }

  /* ── Confetti ── */
  @keyframes confettiFall { 0% { transform:translateY(-20px) rotate(0deg); opacity:1; } 100% { transform:translateY(110vh) rotate(720deg); opacity:0; } }
  .confetti-piece { position:fixed; width:10px; height:10px; pointer-events:none; animation:confettiFall linear forwards; z-index:200; border-radius:2px; }

  /* ── Clap Emojis ── */
  @keyframes clapPop { 0% { transform:translateY(0) scale(0); opacity:1; } 60% { transform:translateY(-80px) scale(1.4); opacity:1; } 100% { transform:translateY(-140px) scale(.8); opacity:0; } }
  .clap-emoji { position:fixed; font-size:2rem; pointer-events:none; animation:clapPop .9s ease-out forwards; z-index:300; }

  /* ── Tease Popup ── */
  @keyframes teaseIn {
    0%   { opacity:0; transform:translateX(-50%) scale(.7) translateY(20px); }
    70%  { transform:translateX(-50%) scale(1.05) translateY(-4px); }
    100% { opacity:1; transform:translateX(-50%) scale(1) translateY(0); }
  }
  .tease-popup {
    position:fixed; bottom:2rem; left:50%; transform:translateX(-50%);
    background:linear-gradient(135deg,rgba(194,24,91,.95),rgba(242,92,138,.9));
    border:1px solid rgba(255,255,255,.3); border-radius:20px;
    padding:1rem 1.6rem; max-width:320px; width:90%;
    color:#fff; font-size:.95rem; line-height:1.6; text-align:center;
    z-index:9998; backdrop-filter:blur(14px);
    animation:teaseIn .5s cubic-bezier(.22,1,.36,1) both;
    box-shadow:0 8px 36px rgba(242,92,138,.55);
  }
  .tease-popup-emoji { font-size:1.7rem; display:block; margin-bottom:.3rem; }

  /* ── Card ── */
  @keyframes cardIn { from { opacity:0; transform:translateY(40px) scale(.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  .card {
    background:var(--card-bg); border:1px solid var(--card-border);
    backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
    border-radius:24px; padding:2.5rem 2rem; max-width:520px; width:93%;
    margin:0 auto; position:relative; z-index:10;
    animation:cardIn .6s cubic-bezier(.22,1,.36,1) both;
    box-shadow:0 8px 48px rgba(242,92,138,.18),0 2px 8px rgba(0,0,0,.4);
  }

  /* ── Progress Bar ── */
  .progress-wrap { display:flex; gap:6px; justify-content:center; margin-bottom:1rem; }
  .progress-dot { width:28px; height:5px; border-radius:999px; background:rgba(255,255,255,.15); transition:background .4s, width .3s; }
  .progress-dot.done   { background:var(--rose); }
  .progress-dot.active { background:var(--gold); width:40px; }

  /* ── Typography ── */
  h1, h2 { font-family:'Playfair Display',serif; color:#fff; line-height:1.3; }
  h1 { font-size:clamp(1.6rem,5vw,2.4rem); margin-bottom:.6rem; }
  h2 { font-size:clamp(1.2rem,4vw,1.7rem); margin-bottom:1.2rem; }
  p  { color:rgba(255,255,255,.8); line-height:1.7; font-size:.97rem; }

  /* ── Buttons ── */
  .btn { display:inline-flex; align-items:center; justify-content:center; gap:.4rem; padding:.75rem 1.8rem; border-radius:50px; border:none; font-family:'Lato',sans-serif; font-size:1rem; font-weight:700; cursor:pointer; transition:transform .2s,box-shadow .2s,opacity .2s; position:relative; z-index:20; }
  .btn:active { transform:scale(.96) !important; }
  .btn-primary { background:linear-gradient(135deg,var(--rose),var(--deep)); color:#fff; box-shadow:0 4px 20px rgba(242,92,138,.45); }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 6px 28px rgba(242,92,138,.6); }
  .btn-secondary { background:rgba(255,255,255,.08); color:rgba(255,255,255,.85); border:1px solid rgba(255,255,255,.18); }
  .btn-secondary:hover { background:rgba(255,255,255,.14); }
  .btn:disabled { opacity:.4; cursor:not-allowed; transform:none !important; box-shadow:none !important; }

  /* ── Options ── */
  .options { display:flex; flex-direction:column; gap:.75rem; margin:1.2rem 0; }
  .option-btn { background:rgba(255,255,255,.06); border:1.5px solid rgba(255,255,255,.14); color:rgba(255,255,255,.9); border-radius:14px; padding:.85rem 1.2rem; text-align:left; font-size:.95rem; cursor:pointer; transition:all .25s; font-family:'Lato',sans-serif; }
  .option-btn:hover { border-color:var(--rose); background:rgba(242,92,138,.1); }
  .option-btn.correct { border-color:#4caf50; background:rgba(76,175,80,.15); color:#a5d6a7; }
  .option-btn.wrong   { border-color:#f44336; background:rgba(244,67,54,.12); color:#ef9a9a; }
  .option-btn.selected { border-color:var(--gold); background:rgba(255,179,71,.12); }

  /* ── Text Input ── */
  .text-input { width:100%; padding:.85rem 1rem; background:rgba(255,255,255,.07); border:1.5px solid rgba(255,255,255,.18); border-radius:12px; color:#fff; font-size:1rem; font-family:'Lato',sans-serif; outline:none; transition:border-color .25s; margin:.6rem 0; }
  .text-input:focus { border-color:var(--rose); }
  .text-input::placeholder { color:rgba(255,255,255,.3); }

  /* ── Message Box ── */
  .msg-box { background:rgba(242,92,138,.1); border:1px solid rgba(242,92,138,.3); border-radius:12px; padding:.9rem 1.1rem; color:rgba(255,255,255,.9); font-size:.93rem; line-height:1.6; margin:1rem 0; animation:cardIn .4s ease both; }

  /* ── Video ── */
  .video-wrap { width:100%; border-radius:16px; overflow:hidden; background:#000; margin:1rem 0; box-shadow:0 4px 24px rgba(0,0,0,.5); }
  .video-wrap video { width:100%; display:block; max-height:320px; object-fit:contain; }

  /* ── Final ── */
  @keyframes pulseHeart { 0%,100% { transform:scale(1); } 50% { transform:scale(1.12); } }
  .final-heart { display:inline-block; animation:pulseHeart 1.2s ease infinite; font-size:3rem; }

  .couple-img { width:100%; max-height:280px; object-fit:cover; border-radius:16px; margin:1rem 0; box-shadow:0 4px 28px rgba(242,92,138,.4); transition:opacity .6s ease; }

  @keyframes finalMsgIn { from { opacity:0; transform:translateY(28px) scale(.93); } to { opacity:1; transform:translateY(0) scale(1); } }
  .final-reveal-msg { animation:finalMsgIn .9s cubic-bezier(.22,1,.36,1) both; font-family:'Dancing Script',cursive; font-size:clamp(1.4rem,5vw,2rem); color:#ffb347; text-align:center; line-height:1.6; margin:1.2rem 0; filter:drop-shadow(0 2px 12px rgba(255,179,71,.55)); }

  /* ── Gallery ── */
  .gallery-wrap { position:relative; width:100%; margin:1rem 0; }
  .gallery-img-wrap { width:100%; border-radius:16px; overflow:hidden; aspect-ratio:4/3; background:#111; position:relative; box-shadow:0 4px 24px rgba(242,92,138,.3); }
  .gallery-img-wrap img { width:100%; height:100%; object-fit:cover; display:block; transition:opacity .4s ease; }
  .gallery-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column; color:rgba(255,255,255,.3); font-size:.85rem; gap:.5rem; }
  .gallery-arrow { position:absolute; top:50%; transform:translateY(-50%); background:rgba(242,92,138,.7); border:none; color:#fff; width:40px; height:40px; border-radius:50%; font-size:1.1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; z-index:20; transition:background .2s, transform .2s; backdrop-filter:blur(6px); }
  .gallery-arrow:hover { background:rgba(242,92,138,1); transform:translateY(-50%) scale(1.1); }
  .gallery-arrow.left  { left:-14px; }
  .gallery-arrow.right { right:-14px; }
  .gallery-dots { display:flex; gap:5px; justify-content:center; margin-top:.8rem; }
  .gallery-dot { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,.2); transition:background .3s, transform .3s; }
  .gallery-dot.active { background:var(--rose); transform:scale(1.3); }
  .gallery-caption { margin-top:.9rem; text-align:center; }
  .gallery-caption-text { font-family:'Dancing Script',cursive; font-size:clamp(1rem,3.5vw,1.35rem); background:linear-gradient(135deg,#ffb347,#f25c8a); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1.5; }
  .gallery-counter { font-size:.75rem; color:rgba(255,255,255,.35); margin-top:.3rem; letter-spacing:.06em; text-transform:uppercase; }

  /* ── Seduce / Wedding ── */
  @keyframes weddingIn {
    0%   { opacity:0; transform:scale(.5) rotate(-5deg); }
    60%  { transform:scale(1.08) rotate(1deg); }
    100% { opacity:1; transform:scale(1) rotate(0); }
  }
  .wedding-reveal {
    animation:weddingIn 1s cubic-bezier(.22,1,.36,1) both;
    text-align:center; padding:1.5rem 1rem;
  }
  .wedding-title {
    font-family:'Dancing Script',cursive;
    font-size:clamp(1.7rem,6vw,2.6rem);
    background:linear-gradient(135deg,#ffb347,#f25c8a,#fff);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
    filter:drop-shadow(0 2px 18px rgba(255,179,71,.7));
    line-height:1.3; margin-bottom:.5rem;
  }
  .wedding-sub { color:rgba(255,255,255,.7); font-size:.95rem; font-style:italic; margin-top:.5rem; }

  @keyframes jumpNo {
    0%,100% { transform:translateY(0); }
    25%      { transform:translateY(-18px) rotate(-8deg); }
    50%      { transform:translateY(-30px) rotate(8deg); }
    75%      { transform:translateY(-12px) rotate(-4deg); }
  }
  .no-jumping { animation:jumpNo .6s ease both; }

  /* ── Misc ── */
  .step-label { font-size:.78rem; color:rgba(255,255,255,.4); text-align:center; margin-bottom:1.2rem; letter-spacing:.08em; text-transform:uppercase; }
  .btn-row { display:flex; gap:.75rem; flex-wrap:wrap; justify-content:center; margin-top:1.4rem; }
  .bg-mesh { position:fixed; inset:0; z-index:0; pointer-events:none; background: radial-gradient(ellipse 80% 60% at 20% 10%,rgba(194,24,91,.28) 0%,transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%,rgba(242,92,138,.18) 0%,transparent 55%), radial-gradient(ellipse 50% 40% at 60% 30%,rgba(255,179,71,.08) 0%,transparent 50%), #1a0a14; }
  .page-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:2rem 1rem; position:relative; z-index:5; }
  input[type=number] { -moz-appearance:textfield; }
  input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
`;

/* ── Tease Banks ── */
const NO_TEASE = [
  { emoji:"😤", text:"No?? Acha acha… Harry ko bata deti hoon 😏" },
  { emoji:"😢", text:"Yeh option toh exist hi nahi karta Ariba ki dictionary mein 💔" },
  { emoji:"😂", text:"No bologe toh Harry rota rehega 24/7 😭 You don't want that, do you?" },
  { emoji:"🥺", text:"No? Are you sure? Harry ka dil toot jayega… soch lo ek baar 🥺💔" },
  { emoji:"😏", text:"Itni baar bhaaga, phir bhi pakad nahi paya? It's not meant to be clicked~ 😂" },
  { emoji:"💅", text:"Baby, 'No' sirf dictionary mein hota hai, Harry ke liye nahi 💖" },
  { emoji:"🫣", text:"No button ne bhi mana kar diya tumhe 😂 Even it knows you're his~" },
];
const WRONG_TEASE = {
  2: [
    { emoji:"😜", text:"Waah waah… imagination toh full filmy hai teri 😂 But real story alag thi!" },
    { emoji:"😏", text:"Tera imagination > reality 😏 Try again, naughty!" },
    { emoji:"🙈", text:"Galat jawab pe bhi full confidence 😂 Harry ko pata hai sach kya hai!" },
  ],
  4: [
    { emoji:"😂", text:"Itne saare options the aur yeh chuna? Harry shocked hai 😂" },
    { emoji:"🤔", text:"Thoda aur sochti toh better hota… Harry thoda judgemental ho raha hai 😜" },
    { emoji:"😏", text:"Andar se kuch aur feel ho raha hai tumhe 😏 Dobara dekho~" },
  ],
  7: [
    { emoji:"😂", text:"Yeh jawab? Really? Harry ne aankh band kar li sharam se 😂" },
    { emoji:"😏", text:"Ariba… tujhe pata hai sahi jawab kya hai 😏 Woh D option dekh~" },
    { emoji:"🫣", text:"Ek chote se sawaal mein itna drama 😂 Hint: D wala option bohot sahi lag raha hai~" },
  ],
};
function pickTease(pool) { return pool[Math.floor(Math.random() * pool.length)]; }

/* ── Gallery Data ──
   9 images: hand1.jpg … hand9.jpg  (place in /public/)
   Each has a mixed sweet+naughty promise caption
── */
const GALLERY_SLIDES = [
  { src:"/hand1.jpeg", caption:"I promise to hold this hand every single day… and never let go 🤝❤️" },
  { src:"/hand2.jpeg", caption:"I promise to keep our nights warm and our mornings warmer 🔥😘" },
  { src:"/hand3.jpeg", caption:"I promise to always find your hand in the dark… and squeeze it naughty 😏💕" },
  { src:"/hand4.jpeg", caption:"I promise to be your biggest hype-man AND your biggest tease 😈❤️" },
  { src:"/hand5.jpeg", caption:"I promise to kiss your hand before every fight and after every make-up 💋🥺" },
  { src:"/hand6.jpeg", caption:"I promise to make you blush in public and scream in private 😏🔥" },
  { src:"/hand7.jpeg", caption:"I promise these hands will build a home, a life, a forever… with you 🏠💖" },
  { src:"/hand8.jpeg", caption:"I promise to be dangerously in love with you… always 😍🌹" },
  { src:"/hand9.jpeg", caption:"I promise: till my last breath, these hands are only Ariba's 🤲💍" },
];

/* ─────────────────────────────────────────────
   REUSABLE COMPONENTS
───────────────────────────────────────────── */
function TeasePopup({ msg, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [msg, onClose]);
  if (!msg) return null;
  return (
    <div className="tease-popup">
      <span className="tease-popup-emoji">{msg.emoji}</span>
      {msg.text}
    </div>
  );
}

const HEARTS = [
  {left:"5%",delay:"0s",dur:"12s",size:"1.2rem",opacity:.5},
  {left:"15%",delay:"2s",dur:"9s",size:".8rem",opacity:.4},
  {left:"28%",delay:"5s",dur:"14s",size:"1.5rem",opacity:.35},
  {left:"42%",delay:"1s",dur:"11s",size:"1rem",opacity:.5},
  {left:"58%",delay:"7s",dur:"10s",size:"1.3rem",opacity:.4},
  {left:"70%",delay:"3s",dur:"13s",size:".9rem",opacity:.45},
  {left:"82%",delay:"6s",dur:"8s",size:"1.1rem",opacity:.4},
  {left:"92%",delay:"4s",dur:"15s",size:"1.4rem",opacity:.3},
  {left:"35%",delay:"9s",dur:"11s",size:".7rem",opacity:.4},
  {left:"50%",delay:"0.5s",dur:"16s",size:"2rem",opacity:.2},
];
function FloatingHearts() {
  return <>{HEARTS.map((h,i)=>(
    <div key={i} className="heart-particle" style={{left:h.left,bottom:"-5%",fontSize:h.size,opacity:h.opacity,animationDuration:h.dur,animationDelay:h.delay}}>💗</div>
  ))}</>;
}

function ProgressBar({ step, total }) {
  return (
    <>
      <div className="progress-wrap">
        {Array.from({length:total}).map((_,i)=>(
          <div key={i} className={`progress-dot ${i<step?"done":i===step?"active":""}`} />
        ))}
      </div>
      <div className="step-label">Step {step+1} of {total}</div>
    </>
  );
}

function EscapingButton({ label, style: extraStyle, onTease }) {
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const count = useRef(0);

  const escape = useCallback(() => {
    const margin=16, bw=btnRef.current?.offsetWidth||100, bh=btnRef.current?.offsetHeight||44;
    const vw=window.innerWidth, vh=window.innerHeight;
    const curr = pos||{left:vw/2,top:vh/2};
    let nx = curr.left < vw/2 ? Math.random()*(vw/2-bw-margin)+vw/2+margin : Math.random()*(vw/2-bw-margin)+margin;
    let ny = curr.top < vh/2 ? Math.random()*(vh/2-bh-margin)+vh/2+margin : Math.random()*(vh/2-bh-margin)+margin;
    nx=Math.max(margin,Math.min(nx,vw-bw-margin));
    ny=Math.max(margin,Math.min(ny,vh-bh-margin));
    setPos({left:nx,top:ny});
    count.current++;
    if (onTease && count.current%2===0) onTease(pickTease(NO_TEASE));
  },[pos,onTease]);

  return (
    <button ref={btnRef} className="btn btn-secondary"
      onMouseEnter={escape} onTouchStart={escape}
      style={{ position:pos?"fixed":"relative", left:pos?.left, top:pos?.top, transition:"left .3s ease,top .3s ease", zIndex:9999, ...extraStyle }}>
      {label}
    </button>
  );
}

function Confetti() {
  const pieces=Array.from({length:60}).map((_,i)=>({ id:i, left:Math.random()*100, delay:Math.random()*2, dur:2.5+Math.random()*2, color:["#f25c8a","#ffb347","#fff","#c2185b","#ff80ab","#ffd54f"][i%6], rotate:Math.random()*360 }));
  return <>{pieces.map(p=><div key={p.id} className="confetti-piece" style={{left:`${p.left}%`,top:0,background:p.color,animationDuration:`${p.dur}s`,animationDelay:`${p.delay}s`,transform:`rotate(${p.rotate}deg)`,borderRadius:p.id%3===0?"50%":"2px"}} />)}</>;
}

function ClapBurst({ active }) {
  if (!active) return null;
  return <>{Array.from({length:10}).map((_,i)=>(
    <div key={i} className="clap-emoji" style={{left:`${20+Math.random()*60}%`,bottom:"20%",animationDelay:`${i*0.08}s`}}>👏</div>
  ))}</>;
}

/* ── Swipeable Gallery ── */
function HandGallery({ onDone }) {
  const [idx, setIdx] = useState(0);
  const [imgStates, setImgStates] = useState(Array(9).fill("loading")); // loading|ok|err
  const touchStart = useRef(null);

  const setImgState = (i, s) => setImgStates(prev => { const n=[...prev]; n[i]=s; return n; });

  const prev = () => setIdx(i => Math.max(0, i-1));
  const next = () => {
    if (idx < GALLERY_SLIDES.length - 1) setIdx(i => i+1);
    else onDone(); // last slide → proceed
  };

  // Touch / swipe support
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (diff > 40) next();
    else if (diff < -40) prev();
    touchStart.current = null;
  };

  const slide = GALLERY_SLIDES[idx];
  const isLast = idx === GALLERY_SLIDES.length - 1;

  return (
    <div className="card">
      <h2 style={{ textAlign:"center", marginBottom:".5rem" }}>Our Moments 🤝💕</h2>
      <p style={{ textAlign:"center", fontSize:".83rem", color:"rgba(255,255,255,.4)", marginBottom:"1rem" }}>
        Swipe or use arrows to navigate
      </p>

      <div className="gallery-wrap">
        {/* Arrows */}
        {idx > 0 && (
          <button className="gallery-arrow left" onClick={prev}>‹</button>
        )}
        {
          <button className="gallery-arrow right" onClick={next}>
            {isLast ? "✓" : "›"}
          </button>
        }

        {/* Image */}
        <div className="gallery-img-wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {imgStates[idx] === "err" ? (
            <div className="gallery-placeholder">
              <span style={{fontSize:"2.5rem"}}>📸</span>
              <span>Place <strong>/public/hand{idx+1}.jpg</strong></span>
            </div>
          ) : (
            <img
              src={slide.src}
              alt={`Moment ${idx+1}`}
              style={{ opacity: imgStates[idx]==="ok" ? 1 : 0 }}
              onLoad={() => setImgState(idx,"ok")}
              onError={() => setImgState(idx,"err")}
            />
          )}
        </div>
      </div>

      {/* Dots */}
      <div className="gallery-dots">
        {GALLERY_SLIDES.map((_,i)=>(
          <div key={i} className={`gallery-dot ${i===idx?"active":""}`} onClick={()=>setIdx(i)} style={{cursor:"pointer"}} />
        ))}
      </div>

      {/* Caption */}
      <div className="gallery-caption">
        <div className="gallery-caption-text">{slide.caption}</div>
        <div className="gallery-counter">{idx+1} / {GALLERY_SLIDES.length}</div>
      </div>

      {isLast && (
        <div className="btn-row">
          <button className="btn btn-primary" onClick={onDone}>Continue 💍</button>
        </div>
      )}
    </div>
  );
}

/* ── Seduce Question ── */
function SeduceQuestion({ onYes }) {
  const [noPos, setNoPos] = useState(null);
  const [noJumping, setNoJumping] = useState(false);
  const noBtnRef = useRef(null);
  const jumpCount = useRef(0);

  const handleNoHover = () => {
    // Jump animation
    setNoJumping(false);
    setTimeout(() => setNoJumping(true), 10);
    setTimeout(() => setNoJumping(false), 700);

    // Also move it
    const margin=16, bw=noBtnRef.current?.offsetWidth||90, bh=noBtnRef.current?.offsetHeight||44;
    const vw=window.innerWidth, vh=window.innerHeight;
    const curr=noPos||{left:vw/2+60,top:vh/2};
    let nx = curr.left<vw/2 ? Math.random()*(vw/2-bw-margin)+vw/2+margin : Math.random()*(vw/2-bw-margin)+margin;
    let ny = curr.top<vh/2 ? Math.random()*(vh/2-bh-margin)+vh/2+margin : Math.random()*(vh/2-bh-margin)+margin;
    nx=Math.max(margin,Math.min(nx,vw-bw-margin));
    ny=Math.max(margin,Math.min(ny,vh-bh-margin));
    setNoPos({left:nx,top:ny});
    jumpCount.current++;
  };

  return (
    <div className="card" style={{textAlign:"center"}}>
      <div style={{fontSize:"2.2rem",marginBottom:".5rem"}}>🌙🥄</div>
      <h2 style={{fontStyle:"italic", marginBottom:"1rem"}}>
        We broke today's Iftar together… 😏
      </h2>
      <p style={{fontSize:"1.05rem", marginBottom:".5rem", color:"rgba(255,255,255,.9)"}}>
        Harry has one more question for you, Ariba… 🥀
      </p>
      <div className="msg-box" style={{fontSize:"1.05rem", lineHeight:"1.9", margin:"1rem 0", textAlign:"left"}}>
        Will you let me be dangerously, <em>lustily</em>, hopelessly yours tonight… and every night after? 😈🔥<br/><br/>
        <span style={{color:"rgba(255,255,255,.6)", fontSize:".9rem"}}>
          (You already know the answer, baby 😏)
        </span>
      </div>
      <div className="btn-row" style={{position:"relative", minHeight:"60px"}}>
        <button className="btn btn-primary" style={{zIndex:20}} onClick={onYes}>
          Yes 🔥😈
        </button>
        <button
          ref={noBtnRef}
          className={`btn btn-secondary${noJumping?" no-jumping":""}`}
          onMouseEnter={handleNoHover}
          onTouchStart={handleNoHover}
          style={{
            position: noPos ? "fixed" : "relative",
            left: noPos?.left, top: noPos?.top,
            transition:"left .3s ease, top .3s ease",
            zIndex:9999,
          }}
        >
          No 😇
        </button>
      </div>
    </div>
  );
}

/* ── Wedding Reveal ── */
function WeddingReveal() {
  const [showConfetti2, setShowConfetti2] = useState(false);

  useEffect(() => {
    setShowConfetti2(true);
    const t = setTimeout(() => setShowConfetti2(false), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {showConfetti2 && <Confetti />}
      <div className="card">
        <div className="wedding-reveal">
          <div style={{fontSize:"3rem", marginBottom:".5rem"}}>💍✨</div>
          <div className="wedding-title">
            Harry Weds Ariba
          </div>
          <div style={{fontFamily:"'Dancing Script',cursive", fontSize:"clamp(1.1rem,4vw,1.5rem)", color:"rgba(255,255,255,.7)", margin:".3rem 0 1.2rem"}}>
            — Max 2027 Mid 🗓️ —
          </div>
          <div style={{fontSize:"1.5rem", marginBottom:"1rem", lineHeight:"2"}}>
            💒🌹🥂🎊💖
          </div>
          <p style={{color:"rgba(255,255,255,.85)", fontSize:"1rem", lineHeight:"1.9", fontStyle:"italic"}}>
            From that Subway to the wedding aisle…<br/>
            Harry & Ariba, forever and always. 🥹❤️
          </p>
          <div style={{marginTop:"1.5rem", padding:"1rem", background:"rgba(255,179,71,.08)", borderRadius:"12px", border:"1px solid rgba(255,179,71,.2)"}}>
            <p style={{color:"#ffb347", fontFamily:"'Dancing Script',cursive", fontSize:"clamp(1rem,3.5vw,1.3rem)", lineHeight:"1.7"}}>
              "I chose you yesterday,<br/>
              I choose you today,<br/>
              and I'll keep choosing you<br/>
              every day till forever." 💛
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   ORIGINAL STEP COMPONENTS (unchanged)
════════════════════════════════════════════ */
function Step1({ onNext, onTease }) {
  return (
    <div className="card">
      <h1 style={{textAlign:"center",marginBottom:"1rem"}}>Forever Valentine 💖</h1>
      <p style={{textAlign:"center",fontSize:"1.1rem",marginBottom:"2rem"}}>Will you be my Valentine forever?</p>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={onNext}>Yes ❤️</button>
        <EscapingButton label="No 🙈" onTease={onTease} />
      </div>
    </div>
  );
}

function Step2({ onNext, onTease }) {
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState("");
  const opts = [
    {label:"Subway 🥪",correct:true},{label:"Stairs 🪜",correct:false},
    {label:"Under the office tables 😈",correct:false},{label:"Back side of my chair 😜",correct:false},
  ];
  const choose = (o) => {
    setSelected(o.label);
    if (o.correct) setMsg("Yes… Subway 🥪 Where destiny ordered us together ❤️");
    else { setMsg("Naughty imagination 😏 But that's not where it started."); onTease(pickTease(WRONG_TEASE[2])); }
  };
  return (
    <div className="card">
      <h2>Where did we first meet? 😏</h2>
      <div className="options">
        {opts.map(o=><button key={o.label} className={`option-btn ${selected===o.label?(o.correct?"correct":"wrong"):""}`} onClick={()=>choose(o)}>{o.label}</button>)}
      </div>
      {msg && <div className="msg-box">{msg}</div>}
      <div className="btn-row"><button className="btn btn-primary" disabled={!selected} onClick={onNext}>Next →</button></div>
    </div>
  );
}

function Step3({ onNext }) {
  const [val, setVal] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submit = () => { if (val.trim()) setSubmitted(true); };
  return (
    <div className="card">
      <h2>What was our first message on Insta/WhatsApp? 💌</h2>
      <input className="text-input" placeholder="Type it here…" value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} disabled={submitted} />
      {submitted && <div className="msg-box">You typed: "<em>{val}</em>" 🥰<br/>That message changed everything.</div>}
      <div className="btn-row">
        {!submitted ? <button className="btn btn-primary" disabled={!val.trim()} onClick={submit}>Submit 💌</button>
                    : <button className="btn btn-primary" onClick={onNext}>Next →</button>}
      </div>
    </div>
  );
}

function Step4({ onNext, onTease }) {
  const [selected, setSelected] = useState(null);
  const opts = ["Biryani 🍛","Clothes 👗","Your Eyes ❤️","Your B**t 😈"];
  const choose = (o) => {
    setSelected(o);
    if (o !== "Your Eyes ❤️" && o !== "Your B**t 😈") onTease(pickTease(WRONG_TEASE[4]));
  };
  const getMessage = (s) => {
    if (s==="Your B**t 😈") return "Actual answer is your Eyes ❤️\nBut he loves teasing your B**t 😜 and secretly enjoys the way your eyes react 😏";
    if (s==="Your Eyes ❤️") return "Correct ❤️ Harry's favourite thing in the world is your beautiful eyes 🥹";
    return "Hmm 😏 Think a little deeper… what does Harry really notice about you?";
  };
  return (
    <div className="card">
      <h2>What is Harry's favourite thing? 😏</h2>
      <div className="options">
        {opts.map(o=><button key={o} className={`option-btn ${selected===o?"selected":""}`} onClick={()=>choose(o)}>{o}</button>)}
      </div>
      {selected && <div className="msg-box" style={{whiteSpace:"pre-line"}}>{getMessage(selected)}</div>}
      <div className="btn-row"><button className="btn btn-primary" disabled={!selected} onClick={onNext}>Next →</button></div>
    </div>
  );
}

function Step5({ onNext }) {
  return (
    <div className="card">
      <h2 style={{fontStyle:"italic"}}>Hey, calm down… 😅</h2>
      <div className="msg-box" style={{fontSize:"1rem",lineHeight:"1.8"}}>
        He knows you might be angry choosing your B**t over your eyes 😅<br/>So he wants to calm you down…<br/><br/>Let's make you smile and make those eyes small 😘
      </div>
      <div className="btn-row"><button className="btn btn-primary" onClick={onNext}>Okay 😤 Next →</button></div>
    </div>
  );
}

function Step6({ onNext }) {
  const videoRef = useRef(null);
  const [ended, setEnded] = useState(false);
  const [noVideo, setNoVideo] = useState(false);
  useEffect(() => {
    const v=videoRef.current; if (!v) return;
    const h=()=>setEnded(true); v.addEventListener("ended",h); return ()=>v.removeEventListener("ended",h);
  },[]);
  return (
    <div className="card">
      <h2 style={{textAlign:"center"}}>A little something for you 🎥❤️</h2>
      <div className="video-wrap">
        <video ref={videoRef} controls onError={()=>setNoVideo(true)} style={{background:"#111"}}>
          <source src="/video.mp4" type="video/mp4"/>
        </video>
      </div>
      {noVideo && <div className="msg-box" style={{textAlign:"center",color:"rgba(255,255,255,.5)"}}>📁 Place your video at <strong>/public/video.mp4</strong><br/><button className="btn btn-secondary" style={{marginTop:".8rem"}} onClick={()=>setEnded(true)}>Skip for now →</button></div>}
      {!noVideo && !ended && <p style={{textAlign:"center",fontSize:".85rem",color:"rgba(255,255,255,.4)",marginTop:".5rem"}}>Watch the full video to continue 🎬</p>}
      {ended && <div className="btn-row"><button className="btn btn-primary" onClick={onNext}>Next →</button></div>}
    </div>
  );
}

function Step7({ onNext, onTease }) {
  const [selected, setSelected] = useState(null);
  const opts = ["Yes 😊","Option A 😶","Both A & B 🤷","Happy as you see his D**k 😈"];
  const choose = (o) => { setSelected(o); if (o!==opts[3]) onTease(pickTease(WRONG_TEASE[7])); };
  return (
    <div className="card">
      <h2>Is your face smiling now? 😏</h2>
      <div className="options">
        {opts.map(o=><button key={o} className={`option-btn ${selected===o?(o===opts[3]?"correct":"wrong"):""}`} onClick={()=>choose(o)}>{o}</button>)}
      </div>
      {selected===opts[3] && <div className="msg-box">That's correct 😏🔥 You naughty girl.</div>}
      <div className="btn-row"><button className="btn btn-primary" disabled={selected!==opts[3]} onClick={onNext}>Next →</button></div>
    </div>
  );
}

function Step8({ onNext }) {
  const [unit, setUnit] = useState(null);
  const [palms, setPalms] = useState("");
  const [palmMsg, setPalmMsg] = useState("");
  const [showClap, setShowClap] = useState(false);
  const [correct, setCorrect] = useState(false);
  const checkPalms = () => {
    if (palms==="2") { setPalmMsg("Good girl 😘"); setShowClap(true); setCorrect(true); setTimeout(()=>setShowClap(false),1500); }
    else setPalmMsg("You're about to lose a chance to become his sathi 😏 Think wisely!");
  };
  return (
    <div className="card">
      <ClapBurst active={showClap}/>
      <h2>How big is his D**k? 😜</h2>
      <p>Choose your unit:</p>
      <div className="btn-row" style={{justifyContent:"flex-start",marginTop:".8rem"}}>
        {["cm","m","palms ✋"].map(u=><button key={u} className={`btn ${unit===u?"btn-primary":"btn-secondary"}`} onClick={()=>{setUnit(u);setPalmMsg("");setPalms("");setCorrect(false);}}>{u}</button>)}
      </div>
      {unit && unit!=="palms ✋" && <div className="msg-box">Wrong unit 😏 Try with something more personal~</div>}
      {unit==="palms ✋" && <>
        <p style={{marginTop:"1rem"}}>How many palms?</p>
        <input type="number" className="text-input" placeholder="Enter a number…" value={palms} onChange={e=>setPalms(e.target.value)} disabled={correct} style={{width:"160px"}}/>
        {!correct && <div className="btn-row" style={{justifyContent:"flex-start"}}><button className="btn btn-primary" onClick={checkPalms} disabled={!palms}>Check ✓</button></div>}
        {palmMsg && <div className="msg-box">{palmMsg}</div>}
      </>}
      <div className="btn-row"><button className="btn btn-primary" disabled={!correct} onClick={onNext}>Next →</button></div>
    </div>
  );
}

function Step9({ onNext, onTease }) {
  return (
    <div className="card">
      <h2 style={{textAlign:"center",fontStyle:"italic"}}>Will you marry me and be with me<br/>for the rest of my life? 💍</h2>
      <div className="options" style={{marginTop:"1.5rem"}}>
        <EscapingButton label="Yes 💍" onTease={onTease} style={{borderRadius:"14px",width:"100%",padding:".85rem",fontSize:".95rem"}}/>
        <EscapingButton label="No 🙈" onTease={onTease} style={{borderRadius:"14px",width:"100%",padding:".85rem",fontSize:".95rem"}}/>
        <button className="option-btn correct" style={{width:"100%",padding:".85rem",textAlign:"center",fontFamily:"Lato,sans-serif"}} onClick={onNext}>
          You are mine already forever 😘 ✅
        </button>
      </div>
    </div>
  );
}

function Step10({ onGallery }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    if (!imgLoaded && !imgError) return;
    const t = setTimeout(() => setShowFinal(true), 7000);
    return () => clearTimeout(t);
  }, [imgLoaded, imgError]);

  return (
    <div className="card" style={{textAlign:"center"}}>
      <div className="final-heart">💖</div>
      <h1 style={{marginTop:".5rem",fontSize:"clamp(1.5rem,5vw,2.2rem)"}}>Hey Wifeyyyy 💖</h1>
      <p style={{fontSize:"1.15rem",margin:"1rem 0",color:"#fce4ec",fontFamily:"Playfair Display,serif",fontStyle:"italic"}}>
        Happy 1 Year Anniversary ❤️
      </p>

      {!imgError ? (
        <img src="/couple.jpeg" alt="Us" className="couple-img"
          onLoad={()=>setImgLoaded(true)} onError={()=>setImgError(true)}
          style={{opacity:imgLoaded?1:0}}/>
      ) : (
        <div className="msg-box" style={{textAlign:"center",color:"rgba(255,255,255,.4)"}}>
          📷 Place your photo at <strong>/public/couple.jpg</strong>
        </div>
      )}

      {!showFinal && (
        <p style={{fontSize:"1.05rem",lineHeight:"1.9",marginTop:"1rem",color:"rgba(255,255,255,.9)"}}>
          Love you so much. 🥺<br/>You're my forever. Always and always. 🌹
        </p>
      )}

      {showFinal && (
        <>
          <div className="final-reveal-msg">
            ✨ Thank you Wifey… 💍<br/>Now I am totally Ariba's 🥹❤️
          </div>
          <div className="btn-row" style={{marginTop:"1.5rem"}}>
            <button className="btn btn-primary" onClick={onGallery}>
              See Our Moments 📸
            </button>
          </div>
        </>
      )}

      {!showFinal && <p style={{marginTop:"1.5rem",fontSize:"2rem"}}>💍🥂✨</p>}
    </div>
  );
}

/* ════════════════════════════════════════════
   ROOT APP
════════════════════════════════════════════ */
// Phases: "steps" | "gallery" | "seduce" | "wedding"
export default function App() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("steps");
  const [showConfetti, setShowConfetti] = useState(false);
  const [teaseMsg, setTeaseMsg] = useState(null);
  const TOTAL = 10;

  useEffect(() => {
    if (document.getElementById("ann-css")) return;
    const el = document.createElement("style");
    el.id = "ann-css"; el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const next = () => {
    const ns = step+1; setStep(ns);
    if (ns === TOTAL-1) { setShowConfetti(true); setTimeout(()=>setShowConfetti(false),5000); }
  };

  const handleTease = useCallback((msg) => { setTeaseMsg(null); setTimeout(()=>setTeaseMsg(msg),60); },[]);
  const clearTease = useCallback(()=>setTeaseMsg(null),[]);

  const steps = [
    <Step1  key={0} onNext={next} onTease={handleTease}/>,
    <Step2  key={1} onNext={next} onTease={handleTease}/>,
    <Step3  key={2} onNext={next}/>,
    <Step4  key={3} onNext={next} onTease={handleTease}/>,
    <Step5  key={4} onNext={next}/>,
    <Step6  key={5} onNext={next}/>,
    <Step7  key={6} onNext={next} onTease={handleTease}/>,
    <Step8  key={7} onNext={next}/>,
    <Step9  key={8} onNext={next} onTease={handleTease}/>,
    <Step10 key={9} onGallery={()=>setPhase("gallery")}/>,
  ];

  return (
    <div style={{position:"relative",minHeight:"100vh"}}>
      <div className="bg-mesh"/>
      <FloatingHearts/>
      {showConfetti && <Confetti/>}
      <TeasePopup msg={teaseMsg} onClose={clearTease}/>

      <div className="page-wrap">
        <div style={{width:"100%",maxWidth:"520px"}}>
          <div className="site-title">hAriba's Harry 💖</div>

          {phase === "steps" && (
            <>
              <ProgressBar step={step} total={TOTAL}/>
              {steps[step]}
            </>
          )}

          {phase === "gallery" && (
            <HandGallery onDone={()=>setPhase("seduce")}/>
          )}

          {phase === "seduce" && (
            <SeduceQuestion onYes={()=>setPhase("wedding")}/>
          )}

          {phase === "wedding" && (
            <WeddingReveal/>
          )}
        </div>
      </div>
    </div>
  );
}