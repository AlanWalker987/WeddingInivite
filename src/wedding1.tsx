// import { useState, useEffect, useRef, useCallback, CSSProperties } from "react";
// import { motion, Variants } from "framer-motion";

// /* ─────────────────────────────────────────────
//    TYPES
// ───────────────────────────────────────────── */
// interface EventItem {
//   icon: string;
//   name: string;
//   date: string;
//   venue: string;
//   desc: string;
// }

// interface Petal {
//   x: number;
//   y: number;
//   r: number;
//   vx: number;
//   vy: number;
//   rot: number;
//   vrot: number;
//   color: string;
//   opacity: number;
//   a: number;
//   va: number;
// }

// interface CountdownTime {
//   d: string;
//   h: string;
//   m: string;
//   s: string;
// }

// type CountdownKey = keyof CountdownTime;

// interface SectionHeaderProps {
//   eyebrow: string;
//   title: string;
//   darkMode?: boolean;
// }

// interface PersonCardProps {
//   initial: string;
//   avatarBg: string;
//   avatarColor: string;
//   name: string;
//   role: string;
//   bio: string;
// }

// interface EventCardProps extends EventItem {
//   delay?: number;
// }

// type ButtonVariant = "solid" | "outline";

// /* ─────────────────────────────────────────────
//    FRAMER MOTION VARIANTS (FIXED)
// ───────────────────────────────────────────── */
// const fadeUp: Variants = {
//   hidden: {
//     opacity: 0,
//     y: 40,
//     scale: 0.98,
//   },
//   visible: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: {
//       duration: 0.8,
//       ease: "easeOut",
//     },
//   },
// };

// /* ─────────────────────────────────────────────
//    GLOBAL CSS
// ───────────────────────────────────────────── */
// const GLOBAL_CSS = `
// *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

// :root {
//   --rose: #c2627a;
//   --rose-light: #f5e6ea;
//   --gold: #c9a96e;
//   --gold-light: #f7f0e6;
//   --sage: #7a9e8a;
//   --cream: #fdf8f3;
//   --charcoal: #3d3535;
//   --border-soft: rgba(194,98,122,0.2);
// }

// body {
//   font-family: 'Cormorant Garamond', serif;
//   background: var(--cream);
//   color: var(--charcoal);
// }
// `;

// /* ─────────────────────────────────────────────
//    DATA
// ───────────────────────────────────────────── */
// const EVENTS: EventItem[] = [
//   {
//     icon: "💍",
//     name: "Engagement Ceremony",
//     date: "May 13, 2026 · 5:00 PM",
//     venue: "Vaishnavi Convention Hall",
//     desc: "Intimate ceremony with family.",
//   },
//   {
//     icon: "🥂",
//     name: "Reception",
//     date: "May 13, 2026 · 7:00 PM",
//     venue: "Vaishnavi Convention Hall",
//     desc: "Music, dinner & celebration.",
//   },
// ];

// /* ─────────────────────────────────────────────
//    HOOK: COUNTDOWN
// ───────────────────────────────────────────── */
// function useCountdown(target: Date): {
//   time: CountdownTime;
//   flipping: Partial<Record<CountdownKey, boolean>>;
// } {
//   const [time, setTime] = useState<CountdownTime>({
//     d: "00",
//     h: "00",
//     m: "00",
//     s: "00",
//   });
//   const [flipping, setFlipping] = useState<
//     Partial<Record<CountdownKey, boolean>>
//   >({});

//   useEffect(() => {
//     const tick = (): void => {
//       const diff = Math.max(
//         0,
//         Math.floor((target.getTime() - Date.now()) / 1000),
//       );
//       const next: CountdownTime = {
//         d: String(Math.floor(diff / 86400)).padStart(2, "0"),
//         h: String(Math.floor((diff % 86400) / 3600)).padStart(2, "0"),
//         m: String(Math.floor((diff % 3600) / 60)).padStart(2, "0"),
//         s: String(diff % 60).padStart(2, "0"),
//       };
//       setTime((prev) => {
//         const flip: Partial<Record<CountdownKey, boolean>> = {};
//         (Object.keys(next) as CountdownKey[]).forEach((k) => {
//           if (prev[k] !== next[k]) flip[k] = true;
//         });
//         if (Object.keys(flip).length) {
//           setFlipping(flip);
//           setTimeout(() => setFlipping({}), 350);
//         }
//         return next;
//       });
//     };
//     tick();
//     const id = setInterval(tick, 1000);
//     return () => clearInterval(id);
//   }, [target]);

//   return { time, flipping };
// }

// /* ─────────────────────────────────────────────
//    NAV (FRAMER)
// ───────────────────────────────────────────── */
// function Nav() {
//   const links = [
//     ["#hero", "Home"],
//     ["#events", "Events"],
//   ];

//   return (
//     <motion.nav
//       initial={{ y: -30, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.6 }}
//       style={{
//         position: "fixed",
//         top: 0,
//         width: "100%",
//         background: "rgba(255,255,255,0.8)",
//         backdropFilter: "blur(10px)",
//         padding: 12,
//         zIndex: 100,
//       }}
//     >
//       <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
//         {links.map(([href, label]) => (
//           <a key={href} href={href} style={{ textDecoration: "none" }}>
//             {label}
//           </a>
//         ))}
//       </div>
//     </motion.nav>
//   );
// }

// /* ─────────────────────────────────────────────
//    HERO
// ───────────────────────────────────────────── */
// function Hero() {
//   return (
//     <section
//       id="hero"
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         textAlign: "center",
//       }}
//     >
//       <motion.div variants={fadeUp} initial="hidden" animate="visible">
//         <h1 style={{ fontSize: 48 }}>Nikhitha & Karthik</h1>
//         <p>13 May 2026</p>
//       </motion.div>
//     </section>
//   );
// }

// /* ─────────────────────────────────────────────
//    COUNTDOWN
// ───────────────────────────────────────────── */
// function Countdown() {
//   const time = useCountdown(new Date("2026-05-13T09:00:00"));

//   return (
//     <motion.section
//       variants={fadeUp}
//       initial="hidden"
//       whileInView="visible"
//       viewport={{ once: true, amount: 0.2 }}
//       style={{ padding: 60, textAlign: "center" }}
//     >
//       <h2>Countdown</h2>
//       <div style={{ fontSize: 32 }}>
//         {time.d}:{time.h}:{time.m}:{time.s}
//       </div>
//     </motion.section>
//   );
// }

// /* ─────────────────────────────────────────────
//    EVENTS
// ───────────────────────────────────────────── */
// function Events() {
//   return (
//     <section style={{ padding: 60 }}>
//       {EVENTS.map((e, i) => (
//         <motion.div
//           key={e.name}
//           variants={fadeUp}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, amount: 0.2 }}
//           transition={{ delay: i * 0.1 }}
//           style={{
//             marginBottom: 20,
//             padding: 20,
//             border: "1px solid #ddd",
//           }}
//         >
//           <h3>
//             {e.icon} {e.name}
//           </h3>
//           <p>{e.date}</p>
//           <p>{e.venue}</p>
//           <p>{e.desc}</p>
//         </motion.div>
//       ))}
//     </section>
//   );
// }

// /* ─────────────────────────────────────────────
//    ROOT
// ───────────────────────────────────────────── */
// export default function WeddingInvitation() {
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.innerHTML = GLOBAL_CSS;
//     document.head.appendChild(style);
//   }, []);

//   return (
//     <>
//       <Nav />
//       <Hero />
//       <Countdown />
//       <Events />
//     </>
//   );
// }
