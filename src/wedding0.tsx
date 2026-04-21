import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
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

interface PersonCardProps {
  initial: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  role: string;
  bio: string;
}

interface EventCardProps extends EventItem {
  delay: string;
}

type ButtonVariant = "solid" | "outline";

/* ─────────────────────────────────────────────
   GLOBAL STYLES
   <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&family=Shadows+Into+Light&display=swap" rel="stylesheet">
───────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&family=Shadows+Into+Light&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --rose: #c2627a;
  --rose-light: #f5e6ea;
  --rose-deep: #9e3f57;
  --gold: #c9a96e;
  --gold-light: #f7f0e6;
  --sage: #7a9e8a;
  --cream: #fdf8f3;
  --charcoal: #3d3535;
  --border-soft: rgba(194,98,122,0.2);
}

html { scroll-behavior: smooth; }

body {
  font-family: 'Cormorant Garamond', serif;
  background: var(--cream);
  color: var(--charcoal);
  overflow-x: hidden;
}

.wi-fade {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.75s ease, transform 0.75s ease;
}
.wi-fade.visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes wi-flip {
  from { transform: translateY(-10px); opacity: 0; }
  to   { transform: translateY(0);     opacity: 1; }
}
.wi-flip { animation: wi-flip 0.3s ease forwards; }

@keyframes wi-pulse {
  0%, 100% { opacity: 0.25; transform: scaleY(0.5); }
  50%       { opacity: 0.9;  transform: scaleY(1);   }
}

.wi-gitem { cursor: pointer; }
.wi-gitem:hover .wi-gswatch { transform: scale(1.07) !important; }
.wi-gitem:hover .wi-govlay  { opacity: 1 !important; }
`;

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const EVENTS: EventItem[] = [
  {
    icon: "💍",
    name: "Engagement Ceremony",
    date: "Wednesday, May 13, 2026 · 5:00 PM",
    venue: "Vaishnavi Convention Hall",
    desc: "An intimate ring exchange ceremony with close family, setting the tone for the celebrations with joy, laughter, and heartfelt blessings.",
  },
  {
    icon: "🥂",
    name: "Wedding Reception",
    date: "Wednesday, May 13, 2026 · 7:00 PM Onwards",
    venue: "Vaishnavi Convention Hall",
    desc: "Celebrate love with a grand evening of fine dining, live music, and dancing. Toast the newlyweds and create memories that last a lifetime.",
  },
  {
    icon: "🕊️",
    name: "Wedding Ceremony",
    date: "Thursday, May 14, 2026 · 10:30 AM - 11:30 AM",
    venue: "SVaishnavi Convention Hall",
    desc: "A sacred and deeply beautiful ceremony where Nikhitha and Karthik take their seven vows under the blessings of elders, priests, and the morning sky.",
  },
];

// const GALLERY: GalleryItem[] = [
//   { bg: "#fce4ec", icon: "🌹", label: "First Date" },
//   { bg: "#e8f5e9", icon: "🌿", label: "Adventure" },
//   { bg: "#fff3e0", icon: "🌅", label: "Sunset" },
//   { bg: "#e3f2fd", icon: "🌊", label: "Beach" },
//   { bg: "#f3e5f5", icon: "💫", label: "Stargazing" },
//   { bg: "#fbe9e7", icon: "🎉", label: "Joy" },
//   { bg: "#e0f7fa", icon: "🌸", label: "Spring" },
//   { bg: "#fff8e1", icon: "🕯️", label: "Romance" },
//   { bg: "#fce4ec", icon: "💍", label: "Proposal" },
// ];

const PETAL_COLORS: string[] = [
  "#c2627a",
  "#e8a0b0",
  "#f5d5dd",
  "#c9a96e",
  "#f0c9b0",
  "#d4b8c2",
];

const WEDDING_DATE = new Date("2026-05-13T09:00:00");

/* ─────────────────────────────────────────────
   HOOK: scroll reveal
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   HOOK: countdown
───────────────────────────────────────────── */
function useCountdown(target: Date): {
  time: CountdownTime;
  flipping: Partial<Record<CountdownKey, boolean>>;
} {
  const [time, setTime] = useState<CountdownTime>({
    d: "00",
    h: "00",
    m: "00",
    s: "00",
  });
  const [flipping, setFlipping] = useState<
    Partial<Record<CountdownKey, boolean>>
  >({});

  useEffect(() => {
    const tick = (): void => {
      const diff = Math.max(
        0,
        Math.floor((target.getTime() - Date.now()) / 1000),
      );
      const next: CountdownTime = {
        d: String(Math.floor(diff / 86400)).padStart(2, "0"),
        h: String(Math.floor((diff % 86400) / 3600)).padStart(2, "0"),
        m: String(Math.floor((diff % 3600) / 60)).padStart(2, "0"),
        s: String(diff % 60).padStart(2, "0"),
      };
      setTime((prev) => {
        const flip: Partial<Record<CountdownKey, boolean>> = {};
        (Object.keys(next) as CountdownKey[]).forEach((k) => {
          if (prev[k] !== next[k]) flip[k] = true;
        });
        if (Object.keys(flip).length) {
          setFlipping(flip);
          setTimeout(() => setFlipping({}), 350);
        }
        return next;
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return { time, flipping };
}

/* ─────────────────────────────────────────────
   PETAL CANVAS
───────────────────────────────────────────── */
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
        opacity: Math.random() * 0.5 + 0.3,
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

/* ─────────────────────────────────────────────
   NAV
───────────────────────────────────────────── */
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
        background: "rgba(253,248,243,0.92)",
        backdropFilter: "blur(12px)",
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
              color: "var(--charcoal)",
              textDecoration: "none",
              opacity: 0.7,
              transition: "opacity 0.2s, color 0.2s",
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.color = "var(--rose)";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.opacity = "0.7";
              e.currentTarget.style.color = "var(--charcoal)";
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
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
          "linear-gradient(160deg,#fdf0f3 0%,#fdf8f3 40%,#f0f3ef 100%)",
      }}
    >
      <PetalCanvas />
      <div style={{ position: "relative", zIndex: 2, padding: 20 }}>
        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 15,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "var(--rose)",
            opacity: 0.85,
            marginBottom: 16,
          }}
        >
          We are getting married
        </p>

        <h1
          style={{
            fontFamily: "'Great Vibes',cursive",
            fontSize: "clamp(52px,10vw,96px)",
            color: "var(--charcoal)",
            lineHeight: 1,
            marginBottom: 6,
          }}
        >
          Nikhitha <span style={{ color: "var(--rose)" }}>&amp;</span> Karthik
        </h1>

        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 18,
            letterSpacing: 3,
            color: "var(--gold)",
            fontWeight: 300,
            marginBottom: 8,
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
            margin: "20px 0",
          }}
        >
          <span
            style={{
              width: 60,
              height: 0.5,
              background: "var(--rose)",
              opacity: 0.4,
              display: "block",
            }}
          />
          <span style={{ color: "var(--rose)", fontSize: 16 }}>❧</span>
          <span
            style={{
              width: 60,
              height: 0.5,
              background: "var(--rose)",
              opacity: 0.4,
              display: "block",
            }}
          />
        </div>

        <p
          style={{
            fontSize: "clamp(16px,2.5vw,22px)",
            fontStyle: "italic",
            color: "var(--charcoal)",
            opacity: 0.75,
            fontWeight: 300,
          }}
        >
          Two souls, one beautiful journey — join us as we begin forever.
        </p>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: 0.5,
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
              background: "var(--rose)",
              margin: "auto",
              animation: "wi-pulse 1.8s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
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
          color: darkMode ? "var(--gold)" : "var(--rose)",
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
          color: darkMode ? "#fff" : "var(--charcoal)",
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
            background: darkMode ? "rgba(201,169,110,0.4)" : "var(--gold)",
            display: "block",
          }}
        />
        <span style={{ color: "var(--gold)", fontSize: 12 }}>✦</span>
        <span
          style={{
            flex: 1,
            maxWidth: 80,
            height: 0.5,
            background: darkMode ? "rgba(201,169,110,0.4)" : "var(--gold)",
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   COUNTDOWN
───────────────────────────────────────────── */
function Countdown() {
  const { time, flipping } = useCountdown(WEDDING_DATE);
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
        background: "var(--charcoal)",
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
          alignItems: "center",
          gap: "clamp(12px,4vw,40px)",
          flexWrap: "wrap",
        }}
      >
        {units.map(({ key, label }, i) => (
          <>
            <div key={key} style={{ textAlign: "center", minWidth: 80 }}>
              <span
                className={flipping[key] ? "wi-flip" : ""}
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(40px,8vw,72px)",
                  fontWeight: 600,
                  color: "var(--gold)",
                  lineHeight: 1,
                  display: "block",
                }}
              >
                {time[key]}
              </span>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 8,
                  display: "block",
                }}
              >
                {label}
              </span>
            </div>
            {i < 3 && (
              <span
                key={`sep-${i}`}
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 48,
                  color: "var(--rose)",
                  opacity: 0.6,
                  paddingBottom: 16,
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

/* ─────────────────────────────────────────────
   PERSON CARD
───────────────────────────────────────────── */
// function PersonCard({
//   initial,
//   avatarBg,
//   avatarColor,
//   name,
//   role,
//   bio,
//   delay,
// }: PersonCardProps) {
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     const obs = new IntersectionObserver(
//       ([e]) => {
//         if (e.isIntersecting) el.classList.add("visible");
//       },
//       { threshold: 0.2 },
//     );
//     obs.observe(el);
//     return () => obs.disconnect();
//   }, []);

//   return (
//     <div
//       ref={ref}
//       className="wi-fade"
//       style={{
//         flex: 1,
//         minWidth: 260,
//         maxWidth: 380,
//         textAlign: "center",
//         padding: "40px 32px",
//         background: "#fff",
//         border: "0.5px solid var(--border-soft)",
//         borderRadius: 2,
//         position: "relative",
//         transitionDelay: delay,
//       }}
//     >
//       {/* Decorative inner border */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 12,
//           border: "0.5px solid var(--border-soft)",
//           pointerEvents: "none",
//         }}
//       />
//       <div
//         style={{
//           width: 120,
//           height: 120,
//           borderRadius: "50%",
//           margin: "0 auto 20px",
//           background: avatarBg,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontFamily: "'Great Vibes',cursive",
//           fontSize: 48,
//           color: avatarColor,
//           border: "2px solid var(--border-soft)",
//         }}
//       >
//         {initial}
//       </div>
//       <div
//         style={{
//           fontFamily: "'Great Vibes',cursive",
//           fontSize: 38,
//           color: "var(--charcoal)",
//           marginBottom: 8,
//         }}
//       >
//         {name}
//       </div>
//       <div
//         style={{
//           fontSize: 11,
//           letterSpacing: 3,
//           textTransform: "uppercase",
//           color: "var(--rose)",
//           marginBottom: 16,
//         }}
//       >
//         {role}
//       </div>
//       <p
//         style={{
//           fontSize: 15,
//           lineHeight: 1.8,
//           color: "rgba(61,53,53,0.7)",
//           fontStyle: "italic",
//         }}
//       >
//         {bio}
//       </p>
//     </div>
//   );
// }

function ProfileRow({
  initial,
  avatarBg,
  avatarColor,
  name,
  role,
  bio,
  reverse = false,
}: PersonCardProps & { reverse?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: reverse ? "row-reverse" : "row",
        alignItems: "center",
        gap: 40,
        margin: "60px 0",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          minWidth: 120,
          height: 120,
          borderRadius: "50%",
          background: avatarBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Great Vibes',cursive",
          fontSize: 48,
          color: avatarColor,
        }}
      >
        {initial}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 500 }}>
        <div
          style={{
            fontFamily: "'Great Vibes',cursive",
            fontSize: 40,
            marginBottom: 6,
            color: "var(--charcoal)",
          }}
        >
          {name}
        </div>

        <div
          style={{
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "var(--rose)",
            marginBottom: 14,
          }}
        >
          {role}
        </div>

        <p
          style={{
            fontSize: 15,
            lineHeight: 1.8,
            color: "rgba(61,53,53,0.75)",
            fontStyle: "italic",
          }}
        >
          {bio}
        </p>
      </div>
    </div>
  );
}
/* ─────────────────────────────────────────────
   COUPLE
───────────────────────────────────────────── */
function Couple() {
  return (
    <section
      id="couple"
      style={{ background: "var(--cream)", padding: "80px 20px" }}
    >
      <SectionHeader eyebrow="The Happy Couple" title="Bride & Groom" />
      <div
        style={{
          display: "flex",
          gap: 40,
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <ProfileRow
          initial="P"
          avatarBg="var(--rose-light)"
          avatarColor="var(--rose)"
          name="Nikhitha"
          role="The Bride"
          bio="A passionate architect with a love for poetry, sunsets, and the ocean breeze..."
          reverse={false}
        />

        <ProfileRow
          initial="A"
          avatarBg="#e8f0ea"
          avatarColor="var(--sage)"
          name="Karthik"
          role="The Groom"
          bio="A software engineer and amateur stargazer who believes every great love story..."
          reverse
        />
        {/* <PersonCard
          initial="P"
          avatarBg="var(--rose-light)"
          avatarColor="var(--rose)"
          name="Nikhitha"
          role="The Bride"
          delay="0s"
          bio="A passionate architect with a love for poetry, sunsets, and the ocean breeze. Nikhitha brings warmth and wonder to every room she enters, and to every heart she touches."
        />
        <PersonCard
          initial="A"
          avatarBg="#e8f0ea"
          avatarColor="var(--sage)"
          name="Karthik"
          role="The Groom"
          delay="0.15s"
          bio="A software engineer and amateur stargazer who believes every great love story is written in the stars. Karthik's calm presence and quiet humour make the world feel lighter."
        /> */}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   EVENT CARD
───────────────────────────────────────────── */
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
        borderLeft: "3px solid var(--rose)",
        boxShadow: "0 1px 0 var(--border-soft)",
        transitionDelay: delay,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--rose-light)",
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
            color: "var(--charcoal)",
            marginBottom: 4,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 13,
            letterSpacing: 1,
            color: "var(--rose)",
            marginBottom: 8,
          }}
        >
          {date}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "var(--charcoal)",
            opacity: 0.8,
            marginBottom: 6,
          }}
        >
          📍 {venue}
        </div>
        <p
          style={{
            fontSize: 14,
            color: "rgba(61,53,53,0.65)",
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

/* ─────────────────────────────────────────────
   EVENTS
───────────────────────────────────────────── */
function Events() {
  return (
    <section
      id="events"
      style={{ background: "var(--gold-light)", padding: "80px 20px" }}
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
          <EventCard key={ev.name} {...ev} delay={`${i * 0.1}s`} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   LOCATION
───────────────────────────────────────────── */
function Location() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="location"
      style={{ background: "var(--cream)", padding: "80px 20px" }}
    >
      <SectionHeader eyebrow="Find Us" title="Venue & Location" />
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Replace this placeholder div with a real Google Maps <iframe>: */}
        <iframe
          src="https://www.google.com/maps?q=Vaishanvi%20Convention%20hall%20Mysuru&output=embed"
          width="100%"
          height="340"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        />

        <div
          ref={ref}
          className="wi-fade"
          style={{
            width: "100%",
            height: 340,
            border: "0.5px solid var(--border-soft)",
            borderRadius: 2,
            background: "var(--rose-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 52 }}>📍</span>
          <span
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 20,
              color: "var(--rose)",
            }}
          >
            Sri Kapaleeshwarar Temple
          </span>
          <span
            style={{
              fontSize: 13,
              color: "rgba(61,53,53,0.6)",
              letterSpacing: 1,
            }}
          >
            Mylapore, Chennai, Tamil Nadu
          </span>
        </div>

        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="https://maps.google.com/?q=Vishanvi+Convention+hall+Mysuru"
            target="_blank"
            rel="noreferrer"
            style={getButtonStyle("solid")}
          >
            View on Google Maps ↗
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   GALLERY
───────────────────────────────────────────── */
// function Gallery() {
//   const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

//   return (
//     <section
//       id="gallery"
//       style={{ background: "var(--charcoal)", padding: "80px 20px" }}
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
//               borderRadius: 1,
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
//                 background: "rgba(61,53,53,0.45)",
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
//             background: "rgba(30,20,20,0.9)",
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
//                 opacity: 0.5,
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

/* ─────────────────────────────────────────────
   RSVP
───────────────────────────────────────────── */
// eslint-disable-line no-unused-vars
// function RSVP() {
//   const [submitted, setSubmitted] = useState<boolean>(false);
//   const [name, setName] = useState<string>("");
//   const [guests, setGuests] = useState<string>("1");

//   const handleSubmit = (): void => {
//     if (name.trim()) setSubmitted(true);
//   };

//   return (
//     <section
//       id="rsvp"
//       style={{
//         background:
//           "linear-gradient(135deg,var(--rose-light) 0%,var(--gold-light) 100%)",
//         padding: "80px 20px",
//         textAlign: "center",
//       }}
//     >
//       <div
//         style={{
//           fontFamily: "'Great Vibes',cursive",
//           fontSize: "clamp(40px,8vw,72px)",
//           color: "var(--charcoal)",
//           marginBottom: 12,
//         }}
//       >
//         Will you join us?
//       </div>
//       <p
//         style={{
//           fontSize: 16,
//           fontStyle: "italic",
//           color: "rgba(61,53,53,0.7)",
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
//             color: "var(--rose-deep)",
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
//           <button onClick={handleSubmit} style={getButtonStyle("solid")}>
//             Confirm Attendance ✓
//           </button>
//         </div>
//       )}
//     </section>
//   );
// }

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        background: "var(--charcoal)",
        color: "rgba(255,255,255,0.5)",
        textAlign: "center",
        padding: "32px 20px",
        fontSize: 13,
        letterSpacing: 2,
      }}
    >
      <p>
        Made with <span style={{ color: "var(--rose)" }}>♥</span> for Karthik
        &amp; Nikhitha · 14 May 2026
      </p>
      <p style={{ marginTop: 8, fontSize: 11, letterSpacing: 1 }}>
        Mysuru, Karnataka
      </p>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   SHARED STYLE HELPERS
───────────────────────────────────────────── */
// const inputStyle: React.CSSProperties = {
//   width: "100%",
//   padding: "12px 20px",
//   fontFamily: "'Cormorant Garamond',serif",
//   fontSize: 16,
//   border: "1px solid var(--border-soft)",
//   background: "#fff",
//   color: "var(--charcoal)",
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
    border: "1px solid var(--rose)",
  };
  return variant === "solid"
    ? { ...base, background: "var(--rose)", color: "#fff" }
    : { ...base, background: "transparent", color: "var(--rose)" };
}

/* ─────────────────────────────────────────────
   ROOT COMPONENT
───────────────────────────────────────────── */
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
