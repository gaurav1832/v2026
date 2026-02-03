"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

// ─── Types ──────────────────────────────────────────────────────────────────
interface HeartParticle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  emoji: string;
}

interface SadParticle {
  id: number;
  left: number;
  duration: number;
  delay: number;
  emoji: string;
}

interface SpotLight {
  id: number;
  left: string;
  width: string;
  color: string;
  duration: number;
  delay: number;
  skew: number;
  swingX: number; // how far it swings in px
}

// ─── Seeded generators ──────────────────────────────────────────────────────
const HEART_EMOJIS = ["💖", "💗", "💓", "💕", "✨", "💝", "💘"];
const SAD_EMOJIS = ["🥺", "😔", "💔", "😭", "😞"];

function generateHearts(count: number): HeartParticle[] {
  return Array.from(
    { length: count },
    (_, i): HeartParticle => ({
      id: i,
      left: (i * 137.5) % 100,
      size: 14 + ((i * 31) % 26),
      duration: 6 + ((i * 7) % 7),
      delay: (i * 1.37) % 6,
      emoji: HEART_EMOJIS[i % HEART_EMOJIS.length],
    }),
  );
}

function generateSadParticles(count: number): SadParticle[] {
  return Array.from(
    { length: count },
    (_, i): SadParticle => ({
      id: i,
      left: (i * 41 + 7) % 100,
      duration: 2.4 + ((i * 0.7) % 1.6),
      delay: (i * 0.48) % 2.2,
      emoji: SAD_EMOJIS[i % SAD_EMOJIS.length],
    }),
  );
}

// ─── Concert spotlight definitions ─────────────────────────────────────────
const SPOTLIGHTS: SpotLight[] = [
  {
    id: 0,
    left: "5%",
    width: "340px",
    color: "rgba(236,64,122,0.40)",
    duration: 7,
    delay: 0,
    skew: 14,
    swingX: 65,
  },
  {
    id: 1,
    left: "20%",
    width: "280px",
    color: "rgba(168,85,247,0.34)",
    duration: 9.5,
    delay: 1.4,
    skew: -7,
    swingX: 80,
  },
  {
    id: 2,
    left: "38%",
    width: "320px",
    color: "rgba(59,130,246,0.30)",
    duration: 11,
    delay: 0.7,
    skew: 5,
    swingX: 55,
  },
  {
    id: 3,
    left: "56%",
    width: "290px",
    color: "rgba(244,114,182,0.37)",
    duration: 8,
    delay: 2.3,
    skew: -11,
    swingX: 70,
  },
  {
    id: 4,
    left: "74%",
    width: "310px",
    color: "rgba(139,92,246,0.32)",
    duration: 10,
    delay: 1.0,
    skew: 8,
    swingX: 60,
  },
  {
    id: 5,
    left: "90%",
    width: "250px",
    color: "rgba(251,113,133,0.35)",
    duration: 6.8,
    delay: 1.9,
    skew: -5,
    swingX: 50,
  },
];

// ─── Perk badge ─────────────────────────────────────────────────────────────
interface PerkProps {
  emoji: string;
  label: string;
}

function Perk({ emoji, label }: PerkProps) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-1.5 text-sm font-semibold
                 bg-pink-50 border border-pink-100 text-rose-700
                 rounded-full px-4 py-1.5 m-1.5"
    >
      <span>{emoji}</span> {label}
    </motion.span>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function ValentineApp() {
  // ── state ──
  const [noCount, setNoCount] = useState<number>(0);
  const [yesClicked, setYesClicked] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("Will you be my Valentine?");
  const [showSad, setShowSad] = useState<boolean>(false);

  // NO button live escape offset
  const [noOffset, setNoOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const noBtnRef = useRef<HTMLButtonElement>(null);

  // audio on YES
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { width, height } = useWindowSize();

  // ── memoised particle arrays (generated once) ──
  const hearts = useMemo(() => generateHearts(32), []);
  const sadParticles = useMemo(() => generateSadParticles(24), []);

  // ── messages ──
  const cuteNoMessages: string[] = [
    "Really no? 🥺",
    "That hurt a little… 😔",
    "My heart is cracking 💔",
    "Okay but… concerts?? 🎶",
    "Food dates tho? 🍕🍰",
    "World tour together?? ✈️🌍",
  ];

  // ── NO button: escape vector away from mouse ──────────────────────────────
  const handleNoMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = noBtnRef.current;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const btnCx = rect.left + rect.width / 2;
      const btnCy = rect.top + rect.height / 2;

      // direction FROM mouse TO button centre — then flip → button runs AWAY
      const dx = btnCx - e.clientX;
      const dy = btnCy - e.clientY;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;

      const escape = 120; // px how far it jumps
      setNoOffset({ x: (dx / len) * escape, y: (dy / len) * escape });
    },
    [],
  );

  const handleNoMouseLeave = useCallback(() => {
    setNoOffset({ x: 0, y: 0 });
  }, []);

  // ── click handlers ──────────────────────────────────────────────────────
  const handleNo = (): void => {
    const next = noCount + 1;
    setNoCount(next);

    if (next > cuteNoMessages.length) {
      setMessage("Okay… I'll stop asking now 🥺💔");
      setShowSad(false);
      return;
    }

    setMessage(cuteNoMessages[next - 1]);
    setShowSad(true);
    setTimeout(() => setShowSad(false), 4500);
  };

  const handleYes = (): void => {
    setYesClicked(true);
    audioRef.current?.play(); // ← plays /love.mp3
  };

  // ═══════════════════════════ RENDER ══════════════════════════════════════
  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #1a0a1e 0%, #2d1040 40%, #1e0a2e 70%, #0f0618 100%)",
      }}
    >
      {/* ──── CONCERT SPOTLIGHTS ──── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        {SPOTLIGHTS.map((s) => (
          <div
            key={s.id}
            style={{
              position: "absolute",
              top: "-40px",
              left: s.left,
              width: s.width,
              height: "80vh",
              background: `radial-gradient(ellipse 100% 55% at 50% 0%, ${s.color} 0%, transparent 72%)`,
              transformOrigin: "top center",
              filter: "blur(10px)",
              animation: `swing${s.id} ${s.duration}s ease-in-out ${s.delay}s infinite alternate`,
            }}
          />
        ))}

        {/* low ambient glow blobs */}
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "12%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(236,64,122,0.28) 0%, transparent 70%)",
            filter: "blur(45px)",
            animation: "blobA 6s ease-in-out infinite alternate",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "8%",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.24) 0%, transparent 70%)",
            filter: "blur(38px)",
            animation: "blobB 8s ease-in-out 1.2s infinite alternate",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "-60px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
            filter: "blur(32px)",
            animation: "blobC 10s ease-in-out 2.5s infinite alternate",
          }}
        />
      </div>

      {/* ──── CONFETTI ──── */}
      {yesClicked && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={350}
          recycle={false}
          colors={[
            "#f06292",
            "#ec407a",
            "#f48fb1",
            "#c084fc",
            "#a855f7",
            "#fda4af",
            "#fb7185",
            "#ffd1e3",
            "#7c3aed",
          ]}
        />
      )}

      {/* ──── FLOATING HEARTS ──── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 5 }}
        aria-hidden="true"
      >
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            className="absolute"
            style={{
              left: `${h.left}%`,
              bottom: "-60px",
              fontSize: `${h.size}px`,
              opacity: 0.45,
            }}
            animate={{ y: [0, -(height + 140)], rotate: [0, 360] }}
            transition={{
              duration: h.duration,
              delay: h.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {h.emoji}
          </motion.div>
        ))}
      </div>

      {/* ──── SAD EMOJI RAIN ──── */}
      <AnimatePresence>
        {showSad && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 10 }}
            aria-hidden="true"
          >
            {sadParticles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute text-3xl"
                style={{ left: `${p.left}%`, top: "-50px" }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: height + 60, opacity: [0, 0.85, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeIn",
                }}
              >
                {p.emoji}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════ MAIN CARD ═══════════ */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative text-center"
        style={{
          zIndex: 20,
          width: "92%",
          maxWidth: "700px", // ← wide card
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.55)",
          borderRadius: "40px",
          padding: "60px 56px 64px", // ← generous padding
          boxShadow:
            "0 30px 80px rgba(236,64,122,0.3), 0 4px 24px rgba(0,0,0,0.14)",
        }}
      >
        <AnimatePresence mode="wait">
          {/* ── ASK STATE ── */}
          {!yesClicked ? (
            <motion.div
              key="ask"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* pulsing heart icon */}
              <motion.div
                className="text-6xl mb-3"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{
                  duration: 1.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                💝
              </motion.div>

              {/* question / dynamic message */}
              <motion.h1
                className="text-3xl font-bold text-rose-600 leading-snug mb-2"
                style={{ fontFamily: "Georgia, serif" }}
                animate={{ scale: [1, 1.035, 1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {message}
              </motion.h1>

              {/* hearts divider */}
              <p className="text-xl opacity-35 mb-5 select-none">
                · 💖 · 💖 · 💖 ·
              </p>

              {/* perk pills */}
              <div className="flex flex-wrap justify-center">
                <Perk emoji="🎶" label="Concerts" />
                <Perk emoji="🍕" label="Food adventures" />
                <Perk emoji="✈️" label="World travel" />
              </div>

              {/* ── BUTTONS ── */}
              <div className="flex justify-center items-center gap-6 mt-10 flex-wrap">
                {/* YES button */}
                <motion.button
                  onClick={handleYes}
                  whileHover={{ scale: 1.18 }}
                  whileTap={{ scale: 0.92 }}
                  animate={{
                    boxShadow: [
                      "0 4px 18px rgba(236,64,122,0.4)",
                      "0 6px 34px rgba(236,64,122,0.72)",
                      "0 4px 18px rgba(236,64,122,0.4)",
                    ],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-white font-bold text-xl px-14 py-4 rounded-full cursor-pointer select-none"
                  style={{
                    background: "linear-gradient(135deg, #f06292, #ec407a)",
                    border: "none",
                  }}
                >
                  YES 💖
                </motion.button>

                {/* NO button — escapes away from the mouse on hover */}
                <motion.button
                  ref={noBtnRef}
                  onClick={handleNo}
                  onMouseEnter={handleNoMouseEnter}
                  onMouseLeave={handleNoMouseLeave}
                  animate={{ x: noOffset.x, y: noOffset.y }}
                  transition={{
                    duration: 0.3,
                    ease: [0.68, -0.55, 0.27, 1.55],
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-500 font-semibold text-xl px-11 py-4 rounded-full cursor-pointer select-none"
                  style={{ background: "#f5f5f5", border: "2px solid #e0e0e0" }}
                >
                  NO 😶
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* ── YES / CELEBRATION STATE ── */
            <motion.div
              key="yes"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
              {/* wiggling emoji trio */}
              <motion.div
                className="text-7xl mb-4"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 1.3, repeat: 2, ease: "easeInOut" }}
              >
                <center>
                  <img
                    width="150"
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGRvOGxmN3ZjbWM2NXYzaWs5ZHhudjltbXNxcGhqam5qZ3VpbTFwayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qfQgXxBz1nvWEbOxyb/giphy.gif"
                  ></img>
                </center>
              </motion.div>

              <h1
                className="text-5xl font-extrabold text-rose-600 leading-tight mb-3"
                style={{ fontFamily: "Georgia, serif" }}
              >
                She Said YES 💖
              </h1>

              <p className="text-lg text-rose-400 mb-6">
                A love story, perfectly balanced ✓
              </p>

              <div className="flex flex-wrap justify-center">
                <Perk emoji="🎶" label="Concerts forever" />
                <Perk emoji="🍕" label="Food dates" />
                <Perk emoji="✈️" label="World tour" />
              </div>
              <p className="mt-6">
                {" "}
                <a
                  className="text-yellow-100 text-lg py-2 px-6 bg-amber-500 rounded-2xl italic"
                  href="https://www.instagram.com/_ggauravvv/"
                >
                  {" "}
                  I Love you 3000!{" "}
                </a>{" "}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ──── AUDIO element (plays on YES click) ──── */}
      <audio ref={audioRef} src="/love.mp3" preload="auto" />

      {/* ──── KEYFRAMES ──── */}
      <style>{`
        /* ── spotlight swings (each one independent) ── */
        @keyframes swing0 {
          from { transform: skewX(14deg)  translateX(-65px); }
          to   { transform: skewX(14deg)  translateX( 65px); }
        }
        @keyframes swing1 {
          from { transform: skewX(-7deg)  translateX(-80px); }
          to   { transform: skewX(-7deg)  translateX( 80px); }
        }
        @keyframes swing2 {
          from { transform: skewX(5deg)   translateX(-55px); }
          to   { transform: skewX(5deg)   translateX( 55px); }
        }
        @keyframes swing3 {
          from { transform: skewX(-11deg) translateX(-70px); }
          to   { transform: skewX(-11deg) translateX( 70px); }
        }
        @keyframes swing4 {
          from { transform: skewX(8deg)   translateX(-60px); }
          to   { transform: skewX(8deg)   translateX( 60px); }
        }
        @keyframes swing5 {
          from { transform: skewX(-5deg)  translateX(-50px); }
          to   { transform: skewX(-5deg)  translateX( 50px); }
        }

        /* ── ambient blob pulses ── */
        @keyframes blobA {
          from { transform: scale(1);    opacity: 0.7; }
          to   { transform: scale(1.3);  opacity: 1;   }
        }
        @keyframes blobB {
          from { transform: scale(1.1);  opacity: 0.6; }
          to   { transform: scale(1.35); opacity: 0.95;}
        }
        @keyframes blobC {
          from { transform: scale(0.9);  opacity: 0.5; }
          to   { transform: scale(1.25); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
