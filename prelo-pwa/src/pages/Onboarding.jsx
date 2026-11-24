// Onboarding.jsx — Splash Screen Animasi Glitch Mode & Auto Swipe-Up ke Homepage
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "../assets/logo.png";

function Onboarding({ onComplete }) {
  const navigate = useNavigate();
  const [isSwipingUp, setIsSwipingUp] = useState(false);

  // Selesaikan onboarding dan transisi swipe ke atas secara santai
  const completeOnboarding = () => {
    if (isSwipingUp) return;
    setIsSwipingUp(true);

    // Tunggu animasi swipe up selesai (750ms), lalu sembunyikan atau pindah route
    setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate("/", { replace: true });
      }
    }, 750);
  };

  useEffect(() => {
    // Durasi lebih santai: Logo glitch selama ~3.6 detik, lalu otomatis swipe ke atas
    const timer = setTimeout(() => {
      completeOnboarding();
    }, 3600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`onboard-glitch-screen ${isSwipingUp ? "swipe-up-active" : ""}`}
      onClick={completeOnboarding}
      title="Ketuk atau klik di mana saja untuk langsung masuk ke Beranda"
    >
      {/* Efek Ambient Glow & Scanlines */}
      <div className="glitch-ambient-glow" />
      <div className="glitch-scanlines" />

      {/* Kontainer Logo Glitch di Tengah */}
      <div className="glitch-center-container">
        <div className="glitch-logo-wrapper">
          {/* Layer Bayangan Kromatik RGB Glitch Split */}
          <img
            src={logoImg}
            alt="Prelo Glitch Cyan"
            className="glitch-img glitch-layer-cyan"
          />
          <img
            src={logoImg}
            alt="Prelo Glitch Red"
            className="glitch-img glitch-layer-red"
          />
          {/* Layer Utama Logo */}
          <img
            src={logoImg}
            alt="Prelo Logo"
            className="glitch-img glitch-layer-main"
          />
        </div>

        {/* Teks Brand dengan Animasi Glitch */}
        <div className="glitch-text-wrapper">
          <span className="glitch-brand-text">PRELO</span>
          <span className="glitch-tagline">JUAL BELI GADGET TERPERCAYA</span>
        </div>
      </div>

      {/* Indikator Swipe Up di Bagian Bawah */}
      <div className="swipe-up-indicator">
        <span className="material-symbols-outlined swipe-icon">
          keyboard_double_arrow_up
        </span>
        <span className="swipe-text">Menuju Beranda...</span>
      </div>
    </div>
  );
}

export default Onboarding;
