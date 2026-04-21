import { useState, useEffect, useRef, useCallback } from "react";

/* =============================================================
   TYPES
============================================================= */
interface EventItem {
  icon: string;
  name: string;
  date: string;
  venue: string;
  desc: string;
}

// interface GalleryItem {
//   bg: string;
//   icon: string;
//   label: string;
// }

interface Petal {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  color: string;
  opacity: number;
  a: number;
  va: number;
}

interface CountdownTime {
  d: string;
  h: string;
  m: string;
  s: string;
}
type CountdownKey = keyof CountdownTime;

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  darkMode?: boolean;
}
interface FlipDigitProps {
  value: string;
  prevValue: string;
  label: string;
  flipping: boolean;
}
interface PersonCardProps {
  side: "left" | "right";
  initial: string;
  name: string;
  role: string;
  traits: string[];
  delay: string;
}
interface EventCardProps extends EventItem {
  delay: string;
}
type ButtonVariant = "solid" | "outline";

/* =============================================================
   GLOBAL STYLES
============================================================= */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Coiny&family=Dancing+Script:wght@400..700&family=Kaushan+Script&family=Parisienne&family=Shadows+Into+Light&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --mauve:        #7c4d6e;
  --mauve-light:  #f0e6ec;
  --mauve-deep:   #55304c;
  --mauve-mid:    #a3698f;
  --champagne:    #c8a97e;
  --champagne-lt: #f5eedf;
  --ivory:        #faf6f1;
  --ink:          #2e2030;
  --ink-soft:     rgba(46,32,48,0.65);
  --border-soft:  rgba(124,77,110,0.18);
  --sage:         #4e7a65;
  --sage-light:   #eaf0ed;
}

html { scroll-behavior: smooth; }
body { font-family: 'Cormorant Garamond', serif; background: var(--ivory); color: var(--ink); overflow-x: hidden; }

.wi-fade { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
.wi-fade.visible { opacity: 1; transform: translateY(0); }

@keyframes wi-pulse {
  0%,100% { opacity: 0.25; transform: scaleY(0.5); }
  50%      { opacity: 0.9;  transform: scaleY(1);   }
}

.wi-gitem { cursor: pointer; }
.wi-gitem:hover .wi-gswatch { transform: scale(1.07) !important; }
.wi-gitem:hover .wi-govlay  { opacity: 1 !important; }

/* ── Whole-tile flip countdown ── */
.flip-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.flip-card {
  width: clamp(76px, 13vw, 108px);
  height: clamp(90px, 16vw, 128px);
  perspective: 900px;
  position: relative;
}

.flip-tile {
  width: 100%;
  height: 100%;
  background: #1e1028;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07);
}

.flip-tile span {
  font-family: 'Playfair Display', serif;
  font-size: clamp(40px, 9vw, 72px);
  font-weight: 600;
  color: var(--champagne);
  line-height: 1;
  user-select: none;
  letter-spacing: -1px;
}

.flip-anim {
  position: absolute;
  inset: 0;
  background: #2b1a3a;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  backface-visibility: hidden;
  box-shadow: 0 6px 24px rgba(0,0,0,0.45);
  z-index: 2;
  pointer-events: none;
}

.flip-anim span {
  font-family: 'Playfair Display', serif;
  font-size: clamp(40px, 9vw, 72px);
  font-weight: 600;
  color: var(--champagne);
  line-height: 1;
  letter-spacing: -1px;
}

.flip-anim.go {
  animation: tileSpin 0.48s cubic-bezier(0.55, 0, 0.45, 1) forwards;
}

@keyframes tileSpin {
  0%   { transform: rotateX(0deg);   opacity: 1; }
  50%  { transform: rotateX(-90deg); opacity: 0.5; }
  100% { transform: rotateX(-90deg); opacity: 0;   }
}

.flip-label {
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.38);
}

/* ── Couple cards ── */
.couple-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2px;
  max-width: 900px;
  margin: 0 auto;
  background: var(--border-soft);
  border: 1px solid var(--border-soft);
  border-radius: 4px;
  overflow: hidden;
}

.couple-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 52px 40px 44px;
  background: var(--ivory);
  gap: 0;
  position: relative;
}

.couple-card.bride { background: #fdf8fc; }
.couple-card.groom { background: #f6fbf8; }

.couple-monogram-wrap {
  position: relative;
  margin-bottom: 28px;
}

.couple-monogram-ring {
  width: 118px;
  height: 118px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.couple-card.bride .couple-monogram-ring {
  background: linear-gradient(135deg, var(--mauve-light) 0%, #fff 100%);
  box-shadow: 0 0 0 1.5px var(--mauve), 0 8px 28px rgba(124,77,110,0.18);
}
.couple-card.groom .couple-monogram-ring {
  background: linear-gradient(135deg, var(--sage-light) 0%, #fff 100%);
  box-shadow: 0 0 0 1.5px var(--sage), 0 8px 28px rgba(78,122,101,0.18);
}

.couple-initial {
  font-family: 'Great Vibes', cursive;
  font-size: 60px;
  line-height: 1;
}
.couple-card.bride .couple-initial { color: var(--mauve); }
.couple-card.groom .couple-initial { color: var(--sage); }

.couple-name {
  font-family: 'Great Vibes', cursive;
  font-size: 42px;
  color: var(--ink);
  margin-bottom: 6px;
  line-height: 1.1;
}

.couple-role {
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--mauve);
  margin-bottom: 28px;
}
.couple-card.groom .couple-role { color: var(--sage); }

.couple-divider {
  width: 40px;
  height: 1px;
  background: currentColor;
  opacity: 0.2;
  margin-bottom: 28px;
}
.couple-card.bride .couple-divider { color: var(--mauve); }
.couple-card.groom .couple-divider { color: var(--sage); }

.couple-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.couple-trait {
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 20px;
  opacity: 0.8;
}
.couple-card.bride .couple-trait {
  color: var(--mauve);
  background: var(--mauve-light);
  border: 0.5px solid rgba(124,77,110,0.25);
}
.couple-card.groom .couple-trait {
  color: var(--sage);
  background: var(--sage-light);
  border: 0.5px solid rgba(78,122,101,0.25);
}

@media (max-width: 580px) {
  .couple-card { padding: 40px 28px 36px; }
}
`;

/* =============================================================
   DATA
============================================================= */
const EVENTS: EventItem[] = [
  {
    icon: "💍",
    name: "Engagement Ceremony",
    date: "Tuesday, May 13, 2026 · 6:00 PM",
    venue: "Vaishnavi Convention Hall, Mysuru",
    desc: "An intimate ring exchange ceremony with close family — setting the tone for the celebrations with joy, laughter, and heartfelt blessings.",
  },
  {
    icon: "🥂",
    name: "Wedding Reception",
    date: "Wednesday, May 13, 2026 · 7:00 PM Onwards",
    venue: "Vaishnavi Convention Hall, Mysuru",
    desc: "Celebrate love with a grand evening of fine dining, live music, and dancing. Toast the newlyweds and create memories that last a lifetime.",
  },
  {
    icon: "🕊️",
    name: "Wedding Ceremony",
    date: "Wednesday, May 14, 2026 · 10:30 AM - 11:30 AM",
    venue: "Vaishnavi Convention Hall, Mysuru",
    desc: "A sacred and deeply beautiful ceremony where Nikhitha and Karthik take their seven vows under the blessings of elders, priests, and the morning sky.",
  },
];

// const GALLERY: GalleryItem[] = [
//   { bg: "#ede0ea", icon: "🌹", label: "First Date" },
//   { bg: "#e0ebe4", icon: "🌿", label: "Adventure" },
//   { bg: "#f5eedf", icon: "🌅", label: "Sunset" },
//   { bg: "#dce8f0", icon: "🌊", label: "Beach" },
//   { bg: "#ebe0ed", icon: "💫", label: "Stargazing" },
//   { bg: "#f0e6e6", icon: "🎉", label: "Joy" },
//   { bg: "#ddeee8", icon: "🌸", label: "Spring" },
//   { bg: "#f5eedf", icon: "🕯️", label: "Romance" },
//   { bg: "#ede0ea", icon: "💍", label: "Proposal" },
// ];

const PETAL_COLORS: string[] = [
  "#a3698f",
  "#c9a0bb",
  "#e8d0e0",
  "#c8a97e",
  "#e8d5b8",
  "#d4afc8",
];

const WEDDING_DATE = new Date("2026-05-13T09:00:00");

/* =============================================================
   HOOK: scroll reveal
============================================================= */
function useScrollReveal(): void {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.14 },
    );
    document
      .querySelectorAll<HTMLElement>(".wi-fade")
      .forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* =============================================================
   HOOK: countdown — tracks current + previous for flip
============================================================= */
function useCountdown(target: Date): {
  current: CountdownTime;
  previous: CountdownTime;
  flipping: Partial<Record<CountdownKey, boolean>>;
} {
  const pad = (n: number): string => String(Math.max(0, n)).padStart(2, "0");

  const calc = useCallback((): CountdownTime => {
    const diff = Math.max(
      0,
      Math.floor((target.getTime() - Date.now()) / 1000),
    );
    return {
      d: pad(Math.floor(diff / 86400)),
      h: pad(Math.floor((diff % 86400) / 3600)),
      m: pad(Math.floor((diff % 3600) / 60)),
      s: pad(diff % 60),
    };
  }, [target]);

  const [current, setCurrent] = useState<CountdownTime>(calc);
  const [previous, setPrevious] = useState<CountdownTime>(calc);
  const [flipping, setFlipping] = useState<
    Partial<Record<CountdownKey, boolean>>
  >({});

  useEffect(() => {
    const tick = (): void => {
      const next = calc();
      setCurrent((prev) => {
        const changed: Partial<Record<CountdownKey, boolean>> = {};
        (Object.keys(next) as CountdownKey[]).forEach((k) => {
          if (prev[k] !== next[k]) changed[k] = true;
        });
        if (Object.keys(changed).length) {
          setPrevious(prev);
          setFlipping(changed);
          setTimeout(() => setFlipping({}), 520);
        }
        return next;
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [calc]);

  return { current, previous, flipping };
}

/* =============================================================
   PETAL CANVAS
============================================================= */
function PetalCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const petalsRef = useRef<Petal[]>([]);

  const initPetals = useCallback((w: number, h: number): void => {
    petalsRef.current = Array.from(
      { length: 42 },
      (): Petal => ({
        x: Math.random() * w,
        y: Math.random() * h - h,
        r: Math.random() * 6 + 4,
        vx: (Math.random() - 0.5) * 0.6,
        vy: Math.random() * 1.2 + 0.5,
        rot: Math.random() * 360,
        vrot: (Math.random() - 0.5) * 2,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        opacity: Math.random() * 0.45 + 0.25,
        a: Math.random() * Math.PI * 2,
        va: Math.random() * 0.02 + 0.005,
      }),
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = (): void => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initPetals(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (): void => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      petalsRef.current.forEach((p) => {
        p.a += p.va;
        p.x += p.vx + Math.sin(p.a) * 0.5;
        p.y += p.vy;
        p.rot += p.vrot;
        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }
        if (p.x < -20) p.x = w + 10;
        if (p.x > w + 20) p.x = -10;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 1.8, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [initPetals]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

/* =============================================================
   NAV
============================================================= */
function Nav() {
  const links: [string, string][] = [
    ["#hero", "Home"],
    ["#countdown", "Countdown"],
    ["#couple", "About Us"],
    ["#events", "Events"],
    ["#location", "Venue"],
    ["#gallery", "Gallery"],
    ["#rsvp", "RSVP"],
  ];
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(250,246,241,0.93)",
        backdropFilter: "blur(14px)",
        borderBottom: "0.5px solid var(--border-soft)",
        padding: "12px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 28,
          flexWrap: "wrap",
          padding: "0 16px",
        }}
      >
        {links.map(([href, label]) => (
          <a
            key={href}
            href={href}
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "var(--ink)",
              textDecoration: "none",
              opacity: 0.65,
              transition: "opacity 0.2s,color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.color = "var(--mauve)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0.65";
              e.currentTarget.style.color = "var(--ink)";
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* =============================================================
   HERO
============================================================= */
function Hero() {
  return (
    <section
      id="hero"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        overflow: "hidden",
        background:
          "linear-gradient(150deg,#f5eaf0 0%,#faf6f1 45%,#edf1ee 100%)",
      }}
    >
      <PetalCanvas />
      <div style={{ position: "relative", zIndex: 2, padding: 20 }}>
        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 14,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: "var(--mauve)",
            opacity: 0.9,
            marginBottom: 18,
          }}
        >
          We are getting married
        </p>
        <h1
          style={{
            fontFamily: "'Great Vibes',cursive",
            fontSize: "clamp(52px,10vw,100px)",
            color: "var(--ink)",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          Karthik
          <span style={{ color: "var(--mauve)" }}>
            <br />
            &amp;
          </span>{" "}
          <br />
          Nikhitha
        </h1>
        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 17,
            letterSpacing: 4,
            color: "var(--champagne)",
            fontWeight: 300,
            marginBottom: 10,
          }}
        >
          13 · 05 · 2026
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            justifyContent: "center",
            margin: "22px 0",
          }}
        >
          <span
            style={{
              width: 64,
              height: 0.5,
              background: "var(--mauve)",
              opacity: 0.35,
              display: "block",
            }}
          />
          <span style={{ color: "var(--mauve)", fontSize: 15 }}>❧</span>
          <span
            style={{
              width: 64,
              height: 0.5,
              background: "var(--mauve)",
              opacity: 0.35,
              display: "block",
            }}
          />
        </div>
        <p
          style={{
            fontSize: "clamp(16px,2.5vw,22px)",
            fontStyle: "italic",
            color: "var(--ink)",
            opacity: 0.65,
            fontWeight: 300,
          }}
        >
          Two souls, one beautiful journey — join us as we begin forever.
        </p>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: 0.45,
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Scroll
          </span>
          <div
            style={{
              width: 1,
              height: 40,
              background: "var(--mauve)",
              margin: "auto",
              animation: "wi-pulse 1.8s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* =============================================================
   SECTION HEADER
============================================================= */
function SectionHeader({
  eyebrow,
  title,
  darkMode = false,
}: SectionHeaderProps) {
  return (
    <div style={{ textAlign: "center", marginBottom: 56 }}>
      <span
        style={{
          fontSize: 12,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: darkMode ? "var(--champagne)" : "var(--mauve)",
          display: "block",
          marginBottom: 12,
        }}
      >
        {eyebrow}
      </span>
      <h2
        style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: "clamp(30px,5vw,46px)",
          fontWeight: 400,
          color: darkMode ? "#fff" : "var(--ink)",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: "center",
          marginTop: 16,
        }}
      >
        <span
          style={{
            flex: 1,
            maxWidth: 80,
            height: 0.5,
            background: darkMode ? "rgba(200,169,126,0.4)" : "var(--champagne)",
            display: "block",
          }}
        />
        <span style={{ color: "var(--champagne)", fontSize: 12 }}>✦</span>
        <span
          style={{
            flex: 1,
            maxWidth: 80,
            height: 0.5,
            background: darkMode ? "rgba(200,169,126,0.4)" : "var(--champagne)",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

/* =============================================================
   FLIP DIGIT — whole-tile 3-D rotation, no state/effects
   prevValue & flipping come from parent hook
============================================================= */
function FlipDigit({ value, prevValue, label, flipping }: FlipDigitProps) {
  return (
    <div className="flip-unit">
      <div className="flip-card">
        {/* Static tile — always shows current value underneath */}
        <div className="flip-tile">
          <span>{value}</span>
        </div>
        {/* Animated overlay — shows old value then spins away */}
        <div className={`flip-anim${flipping ? " go" : ""}`}>
          <span>{flipping ? prevValue : value}</span>
        </div>
      </div>
      <span className="flip-label">{label}</span>
    </div>
  );
}

/* =============================================================
   COUNTDOWN
============================================================= */
function Countdown() {
  const { current, previous, flipping } = useCountdown(WEDDING_DATE);

  const units: { key: CountdownKey; label: string }[] = [
    { key: "d", label: "Days" },
    { key: "h", label: "Hours" },
    { key: "m", label: "Minutes" },
    { key: "s", label: "Seconds" },
  ];

  return (
    <section
      id="countdown"
      style={{
        background: "#140d1c",
        padding: "80px 20px",
        textAlign: "center",
      }}
    >
      <SectionHeader
        eyebrow="The Big Day"
        title="Counting Down to Forever"
        darkMode
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "clamp(12px,3vw,40px)",
          flexWrap: "wrap",
        }}
      >
        {units.map(({ key, label }, i) => (
          <>
            <FlipDigit
              key={key}
              value={current[key]}
              prevValue={previous[key]}
              label={label}
              flipping={!!flipping[key]}
            />
            {i < 3 && (
              <span
                key={`sep-${i}`}
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(32px,6vw,56px)",
                  color: "var(--mauve-mid)",
                  opacity: 0.6,
                  paddingTop: "clamp(18px,3vw,28px)",
                }}
              >
                :
              </span>
            )}
          </>
        ))}
      </div>
    </section>
  );
}

/* =============================================================
   COUPLE — redesigned: centred card grid, no bio text
============================================================= */
function PersonCard({
  side,
  initial,
  name,
  role,
  traits,
  delay,
}: PersonCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  console.log(traits);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.18 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`wi-fade couple-card ${side === "left" ? "bride" : "groom"}`}
      style={{ transitionDelay: delay }}
    >
      <div className="couple-monogram-wrap">
        <div className="couple-monogram-ring">
          <span className="couple-initial">{initial}</span>
        </div>
      </div>
      <div className="couple-name">{name}</div>
      <div className="couple-role">{role}</div>
      <div className="couple-divider" />
      {/* <div className="couple-traits">
        {traits.map((t) => (
          <span key={t} className="couple-trait">
            {t}
          </span>
        ))}
      </div> */}
    </div>
  );
}

function Couple() {
  return (
    <section
      id="couple"
      style={{ background: "var(--ivory)", padding: "80px 20px" }}
    >
      <SectionHeader eyebrow="The Happy Couple" title="Bride & Groom" />
      <div className="couple-grid">
        <PersonCard
          side="left"
          initial="P"
          name="Nikhitha"
          role="The Bride"
          traits={["Dreamer", "Architect", "Book Lover", "Ocean Soul"]}
          delay="0s"
        />
        <PersonCard
          side="right"
          initial="A"
          name="Karthik"
          role="The Groom"
          traits={["Stargazer", "Engineer", "Film Buff", "Coffee Aficionado"]}
          delay="0.15s"
        />
      </div>
    </section>
  );
}

/* =============================================================
   EVENT CARD
============================================================= */
function EventCard({ icon, name, date, venue, desc, delay }: EventCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="wi-fade"
      style={{
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
        padding: "28px 32px",
        background: "#fff",
        borderLeft: "3px solid var(--mauve)",
        boxShadow: "0 1px 0 var(--border-soft)",
        transitionDelay: delay,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--mauve-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 20,
            fontWeight: 600,
            color: "var(--ink)",
            marginBottom: 4,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 13,
            letterSpacing: 1,
            color: "var(--mauve)",
            marginBottom: 8,
          }}
        >
          {date}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--ink)",
            opacity: 0.75,
            marginBottom: 6,
          }}
        >
          📍 {venue}
        </div>
        <p
          style={{
            fontSize: 14,
            color: "var(--ink-soft)",
            fontStyle: "italic",
            lineHeight: 1.7,
          }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

function Events() {
  return (
    <section
      id="events"
      style={{ background: "var(--champagne-lt)", padding: "80px 20px" }}
    >
      <SectionHeader eyebrow="Celebrations" title="Wedding Events" />
      <div
        style={{
          maxWidth: 780,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {EVENTS.map((ev, i) => (
          <EventCard key={ev.name} {...ev} delay={`${i * 0.12}s`} />
        ))}
      </div>
    </section>
  );
}

/* =============================================================
   LOCATION — Vaishnavi Convention Hall, Mysuru with real map
============================================================= */
function Location() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.18 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="location"
      style={{ background: "var(--ivory)", padding: "80px 20px" }}
    >
      <SectionHeader eyebrow="Find Us" title="Venue & Location" />
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Venue info card */}
        <div
          ref={ref}
          className="wi-fade"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 0,
            marginBottom: 16,
            border: "0.5px solid var(--border-soft)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          {/* Left: details */}
          <div
            style={{
              flex: "1 1 260px",
              padding: "36px 40px",
              background: "var(--mauve-light)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 22,
                color: "var(--mauve-deep)",
                fontWeight: 600,
              }}
            >
              Vaishnavi Convention Hall
            </div>
            <div
              style={{
                fontSize: 14,
                color: "var(--ink-soft)",
                lineHeight: 1.7,
              }}
            >
              Near Maharshi School
              <br />
              Visveshwara nagar, Mysuru
              <br />
              Karnataka — 570 008
            </div>
            {/* <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--mauve)",
                  letterSpacing: 0.5,
                }}
              >
                📅 &nbsp;Thursday, 14 May 2026
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--mauve)",
                  letterSpacing: 0.5,
                }}
              >
                🕘 &nbsp; 10:30 AM - 11:30 AM
              </div>
            </div> */}
            <a
              href="https://maps.google.com/?q=Vishanvi+Convention+hall+Mysuru"
              target="_blank"
              rel="noreferrer"
              style={getButtonStyle("solid")}
            >
              Open in Maps ↗
            </a>
          </div>
          {/* Right: embedded map */}
          <div style={{ flex: "1 1 340px", minHeight: 320, marginTop: "20px" }}>
            <iframe
              title="Vaishnavi Convention Hall Mysuru"
              src="https://www.google.com/maps?q=Vaishnavi+Convention+Hall+Mysuru&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block", minHeight: 320 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============================================================
   GALLERY
============================================================= */
// function Gallery() {
//   const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

//   return (
//     <section
//       id="gallery"
//       style={{ background: "#140d1c", padding: "80px 20px" }}
//     >
//       <SectionHeader eyebrow="Moments Together" title="Our Gallery" darkMode />
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))",
//           gap: 8,
//           maxWidth: 880,
//           margin: "0 auto",
//         }}
//       >
//         {GALLERY.map((item) => (
//           <div
//             key={item.label}
//             className="wi-gitem"
//             onClick={() => setLightbox(item)}
//             style={{
//               aspectRatio: "1",
//               overflow: "hidden",
//               position: "relative",
//               borderRadius: 4,
//             }}
//           >
//             <div
//               className="wi-gswatch"
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 background: item.bg,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: 32,
//                 transition: "transform 0.4s",
//               }}
//             >
//               {item.icon}
//             </div>
//             <div
//               className="wi-govlay"
//               style={{
//                 position: "absolute",
//                 inset: 0,
//                 background: "rgba(46,32,48,0.5)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 fontSize: 28,
//                 opacity: 0,
//                 transition: "opacity 0.3s",
//               }}
//             >
//               🔍
//             </div>
//           </div>
//         ))}
//       </div>
//       {lightbox && (
//         <div
//           onClick={() => setLightbox(null)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             zIndex: 999,
//             background: "rgba(20,13,28,0.93)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             cursor: "pointer",
//           }}
//         >
//           <div
//             style={{
//               textAlign: "center",
//               color: "#fff",
//               fontFamily: "'Playfair Display',serif",
//               padding: 40,
//             }}
//           >
//             <div style={{ fontSize: 80, marginBottom: 16 }}>
//               {lightbox.icon}
//             </div>
//             <div style={{ fontSize: 26 }}>{lightbox.label}</div>
//             <div
//               style={{
//                 fontSize: 13,
//                 opacity: 0.45,
//                 marginTop: 8,
//                 letterSpacing: 2,
//               }}
//             >
//               Nikhitha &amp; Karthik · 2026
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }

/* =============================================================
   RSVP
============================================================= */
// function RSVP() {
//   const [submitted, setSubmitted] = useState<boolean>(false);
//   const [name, setName] = useState<string>("");
//   const [guests, setGuests] = useState<string>("1");

//   return (
//     <section
//       id="rsvp"
//       style={{
//         background:
//           "linear-gradient(135deg,var(--mauve-light) 0%,var(--champagne-lt) 100%)",
//         padding: "80px 20px",
//         textAlign: "center",
//       }}
//     >
//       <div
//         style={{
//           fontFamily: "'Great Vibes',cursive",
//           fontSize: "clamp(40px,8vw,72px)",
//           color: "var(--ink)",
//           marginBottom: 12,
//         }}
//       >
//         Will you join us?
//       </div>
//       <p
//         style={{
//           fontSize: 16,
//           fontStyle: "italic",
//           color: "var(--ink-soft)",
//           marginBottom: 36,
//           letterSpacing: 1,
//         }}
//       >
//         Kindly confirm your presence by April 30, 2026
//       </p>
//       {submitted ? (
//         <div
//           style={{
//             fontFamily: "'Playfair Display',serif",
//             fontSize: 22,
//             color: "var(--mauve-deep)",
//           }}
//         >
//           🌸 Thank you, {name}! We can't wait to celebrate with you.
//         </div>
//       ) : (
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             gap: 16,
//             maxWidth: 380,
//             margin: "0 auto",
//           }}
//         >
//           <input
//             placeholder="Your Name"
//             value={name}
//             onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//               setName(e.target.value)
//             }
//             style={inputStyle}
//           />
//           <select
//             value={guests}
//             onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
//               setGuests(e.target.value)
//             }
//             style={inputStyle}
//           >
//             {["1", "2", "3", "4", "5+"].map((n) => (
//               <option key={n} value={n}>
//                 {n} Guest{n !== "1" ? "s" : ""}
//               </option>
//             ))}
//           </select>
//           <button
//             onClick={() => {
//               if (name.trim()) setSubmitted(true);
//             }}
//             style={getButtonStyle("solid")}
//           >
//             Confirm Attendance ✓
//           </button>
//         </div>
//       )}
//     </section>
//   );
// }

/* =============================================================
   FOOTER
============================================================= */
function Footer() {
  return (
    <footer
      style={{
        background: "#140d1c",
        color: "rgba(255,255,255,0.4)",
        textAlign: "center",
        padding: "32px 20px",
        fontSize: 13,
        letterSpacing: 2,
      }}
    >
      <p>
        Made with <span style={{ color: "var(--mauve-mid)" }}>♥</span> for
        Karthik &amp; Nikhitha · 14 May 2026
      </p>
      <p style={{ marginTop: 8, fontSize: 11, letterSpacing: 1 }}>
        Vaishnavi Convention Hall, Mysuru
      </p>
    </footer>
  );
}

/* =============================================================
   SHARED HELPERS
============================================================= */
// const inputStyle: React.CSSProperties = {
//   width: "100%",
//   padding: "12px 20px",
//   fontFamily: "'Cormorant Garamond',serif",
//   fontSize: 16,
//   border: "1px solid var(--border-soft)",
//   background: "#fff",
//   color: "var(--ink)",
//   outline: "none",
//   borderRadius: 2,
// };

function getButtonStyle(variant: ButtonVariant): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-block",
    padding: "12px 32px",
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 15,
    letterSpacing: 2,
    textTransform: "uppercase",
    textDecoration: "none",
    cursor: "pointer",
    borderRadius: 2,
    transition: "all 0.3s",
    border: "1px solid var(--mauve)",
  };
  return variant === "solid"
    ? { ...base, background: "var(--mauve)", color: "#fff" }
    : { ...base, background: "transparent", color: "var(--mauve)" };
}

/* =============================================================
   ROOT
============================================================= */
export default function WeddingInvitation() {
  useEffect(() => {
    const id = "wi-global-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }
  }, []);

  useScrollReveal();

  return (
    <>
      <Nav />
      <Hero />
      <Countdown />
      <Couple />
      <Events />
      <Location />
      {/* <Gallery /> */}
      {/* <RSVP /> */}
      <Footer />
    </>
  );
}
