import { useState, useEffect } from "react";
import splashImage from "@/assets/splash.png";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("hold"), 800);
    const exitTimer = setTimeout(() => setPhase("exit"), 2500);
    const doneTimer = setTimeout(() => onFinish(), 3200);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-700 ${
        phase === "exit" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Glow ring */}
      <div
        className={`absolute w-72 h-72 rounded-full transition-all duration-1000 ${
          phase === "enter"
            ? "scale-0 opacity-0"
            : "scale-100 opacity-60"
        }`}
        style={{
          background: "radial-gradient(circle, hsl(195 100% 50% / 0.3) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Main image */}
      <img
        src={splashImage}
        alt="Splash"
        className={`relative z-10 max-w-[80vw] max-h-[70vh] object-contain transition-all duration-800 ease-out ${
          phase === "enter"
            ? "scale-50 opacity-0 blur-md"
            : phase === "hold"
            ? "scale-100 opacity-100 blur-0"
            : "scale-110 opacity-0 blur-sm"
        }`}
        style={{ transitionDuration: phase === "enter" ? "800ms" : "700ms" }}
      />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className={`absolute w-1 h-1 rounded-full bg-primary transition-all ${
              phase === "enter" ? "opacity-0" : "opacity-80"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationName: "pulse",
              animationDuration: `${1 + Math.random() * 2}s`,
              animationIterationCount: "infinite",
              transitionDelay: `${Math.random() * 0.5}s`,
              transitionDuration: "600ms",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
