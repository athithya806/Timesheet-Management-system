import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function LoginPage() {
  const gridRef = useRef(null);
  const particlesRef = useRef(null);
  const rafRef = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const speedMultiplier = useRef(1);

  const drag = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    dx: 0,
    dy: 0,
  });

  useEffect(() => {
    const gridCanvas = gridRef.current;
    const partCanvas = particlesRef.current;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      [gridCanvas, partCanvas].forEach((c) => {
        c.width = Math.floor(w * dpr);
        c.height = Math.floor(h * dpr);
        c.style.width = w + "px";
        c.style.height = h + "px";
        const ctx = c.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      });
    }
    resize();
    window.addEventListener("resize", resize);

    // Grid & particles init
    const gridCtx = gridCanvas.getContext("2d");
    const partCtx = partCanvas.getContext("2d");
    const gridPoints = [];
    const particles = [];
    const streaks = [];

    function initGrid() {
      const spacing = 80;
      const cols = Math.ceil(window.innerWidth / spacing) + 2;
      const rows = Math.ceil(window.innerHeight / spacing) + 2;
      gridPoints.length = 0;
      for (let y = -1; y < rows; y++) {
        for (let x = -1; x < cols; x++) {
          gridPoints.push({
            x: x * spacing + (Math.random() - 0.5) * spacing * 0.4,
            y: y * spacing + (Math.random() - 0.5) * spacing * 0.35,
          });
        }
      }
    }

    function drawGrid() {
      gridCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
      gridCtx.fillStyle = "rgba(2,8,20,0.95)";
      gridCtx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);
      gridCtx.strokeStyle = "rgba(0,180,255,0.08)";
      gridCtx.lineWidth = 1;

      const cols = Math.ceil(window.innerWidth / 80) + 2;
      for (let i = 0; i < gridPoints.length; i++) {
        const p = gridPoints[i];
        const right = gridPoints[i + 1];
        const bottom = gridPoints[i + cols];
        const bottomRight = gridPoints[i + cols + 1];

        if (right) {
          gridCtx.beginPath();
          gridCtx.moveTo(p.x, p.y);
          gridCtx.lineTo(right.x, right.y);
          gridCtx.stroke();
        }
        if (bottom) {
          gridCtx.beginPath();
          gridCtx.moveTo(p.x, p.y);
          gridCtx.lineTo(bottom.x, bottom.y);
          gridCtx.stroke();
        }
        if (bottomRight) {
          gridCtx.beginPath();
          gridCtx.moveTo(p.x, p.y);
          gridCtx.lineTo(bottomRight.x, bottomRight.y);
          gridCtx.stroke();
        }
      }
    }

    function initParticles() {
      particles.length = 0;
      streaks.length = 0;
      const count = Math.floor(window.innerWidth / 12);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vy: 0.2 + Math.random() * 1.2,
          size: 0.8 + Math.random() * 2.2,
          hue: Math.random() > 0.92 ? 35 : 190,
        });
      }
    }

    initGrid();
    initParticles();

    function updateParticles() {
      partCtx.clearRect(0, 0, partCanvas.width, partCanvas.height);
      partCtx.globalCompositeOperation = "lighter";
      particles.forEach((p) => {
        p.y -= (p.vy + drag.current.dy * 0.02) * speedMultiplier.current;
        p.x += drag.current.dx * 0.02 * speedMultiplier.current;
        if (p.y < -10) {
          p.y = window.innerHeight + 10;
          p.x = Math.random() * window.innerWidth;
          p.vy = 0.2 + Math.random() * 1.2;
        }
        const hue = p.hue === 35 ? "255,160,60" : "120,220,255";
        partCtx.beginPath();
        partCtx.fillStyle = `rgba(${hue},0.95)`;
        partCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        partCtx.fill();
      });
      partCtx.globalCompositeOperation = "source-over";

      drag.current.dx *= 0.92;
      drag.current.dy *= 0.92;
    }

    function tick() {
      drawGrid();
      updateParticles();
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    function handleDown(e) {
      drag.current.active = true;
      drag.current.lastX = e.clientX || e.touches?.[0].clientX;
      drag.current.lastY = e.clientY || e.touches?.[0].clientY;
    }
    function handleMove(e) {
      if (!drag.current.active) return;
      const x = e.clientX || e.touches?.[0].clientX;
      const y = e.clientY || e.touches?.[0].clientY;
      drag.current.dx = x - drag.current.lastX;
      drag.current.dy = y - drag.current.lastY;
      drag.current.lastX = x;
      drag.current.lastY = y;
    }
    function handleUp() {
      drag.current.active = false;
    }

    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchstart", handleDown);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchstart", handleDown);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    speedMultiplier.current = 6;
    setTimeout(() => navigate("/timesheet"), 700);
  }

  return (
    <div className="login-scene">
      <canvas ref={gridRef} className="login-scene__grid-canvas" />
      <canvas ref={particlesRef} className="login-scene__particles-canvas" />

      <div className="login-scene__holo-platform" aria-hidden>
        <div className="login-scene__ring"></div>
        <svg className="login-scene__padlock" viewBox="0 0 80 100">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d="M25 38 Q25 18 40 18 Q55 18 55 38" fill="none" stroke="rgba(120,220,255,0.95)" strokeWidth="3.2" strokeLinecap="round" filter="url(#glow)" />
          <rect x="16" y="38" rx="8" ry="8" width="48" height="48" fill="rgba(6,18,26,0.45)" stroke="rgba(120,220,255,0.7)" strokeWidth="2" filter="url(#glow)" />
          <circle cx="40" cy="62" r="4" fill="rgba(8,12,16,0.95)" stroke="rgba(120,220,255,0.9)" strokeWidth="1.2" filter="url(#glow)" />
          <rect x="39" y="66" width="2" height="8" rx="1" fill="rgba(8,12,16,0.95)" />
        </svg>
      </div>

      <div className="login-scene__login-box">
        <h2>LoGIn</h2>
        <form onSubmit={handleSubmit}>
          <div className="login-scene__input-group">
            <input id="user" placeholder=" " required />
            <label htmlFor="user">Username</label>
          </div>
          <div className="login-scene__input-group">
            <input id="pass" type="password" placeholder=" " required />
            <label htmlFor="pass">Password</label>
          </div>
          <button type="submit" className={loading ? "loading" : ""}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
