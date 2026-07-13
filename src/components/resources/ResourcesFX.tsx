import { useEffect, useRef } from "react";
import meditation from "@/assets/meditation.jpg";

// ASCII "lines" style photo effect (recipe from 21st.dev/community/ascii),
// reimplemented in Canvas2D. Used as the fixed backdrop of the Resources
// directory. Colors picked to sit under a liquid-glass UI.
const CFG = {
  renderMode: "lines" as const,
  bgOpacity: 0.63,
  bgBlur: 12,
  cellSize: 5,
  coverage: 4,
  brightness: -1,
  contrast: 115,
  edgeEmphasis: 40,
  tint: "#00ff66",
  tintOpacity: 0.45,
  saturation: 1.0,
  pfx: {
    vignette: 0.38,
    scanLines: 0.28,
    chromatic: 40,
    bloom: 0.6,
    filmGrain: 0.4,
    glitch: 0.2,
    halftone: 0.2,
    filmDust: 0.2,
  },
};

export function ResourcesFX() {
  const cRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-pc-resources", "");
    return () => document.documentElement.removeAttribute("data-pc-resources");
  }, []);

  useEffect(() => {
    const canvas = cRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = meditation;

    let raf = 0;
    let ready = false;
    img.onload = () => { ready = true; render(); };

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      if (ready) render();
    }

    // ------------- sampler: draws source, applies color grade, returns ImageData -------------
    function grade(off: OffscreenCanvas | HTMLCanvasElement, w: number, h: number) {
      const o = off.getContext("2d")!;
      // cover-fit the source photo
      const ar = img.width / img.height;
      let dw = w, dh = h;
      if (w / h > ar) { dh = w / ar; } else { dw = h * ar; }
      const dx = (w - dw) / 2, dy = (h - dh) / 2;
      o.clearRect(0, 0, w, h);
      o.drawImage(img, dx, dy, dw, dh);
      // brightness/contrast/saturation via filter
      o.globalCompositeOperation = "source-over";
      // grade colors by re-drawing with filter
      const tmp = document.createElement("canvas");
      tmp.width = w; tmp.height = h;
      const tctx = tmp.getContext("2d")!;
      tctx.filter = `brightness(${1 + CFG.brightness / 100}) contrast(${CFG.contrast}%) saturate(${CFG.saturation * 100}%)`;
      tctx.drawImage(off as CanvasImageSource, 0, 0);
      o.clearRect(0, 0, w, h);
      o.drawImage(tmp, 0, 0);
      // tint overlay
      o.globalCompositeOperation = "overlay";
      o.fillStyle = CFG.tint;
      o.globalAlpha = CFG.tintOpacity;
      o.fillRect(0, 0, w, h);
      o.globalAlpha = 1;
      o.globalCompositeOperation = "source-over";
      return o.getImageData(0, 0, w, h);
    }

    function render() {
      const W = canvas!.width, H = canvas!.height;
      if (W === 0 || H === 0) return;
      ctx!.save();
      ctx!.clearRect(0, 0, W, H);

      // ------------- 1. background: blurred original -------------
      const ar = img.width / img.height;
      let dw = W, dh = H;
      if (W / H > ar) dh = W / ar; else dw = H * ar;
      const dx = (W - dw) / 2, dy = (H - dh) / 2;
      ctx!.globalAlpha = CFG.bgOpacity;
      ctx!.filter = `blur(${CFG.bgBlur}px) brightness(0.55)`;
      ctx!.drawImage(img, dx, dy, dw, dh);
      ctx!.filter = "none";
      ctx!.globalAlpha = 1;
      // dark wash so glass reads
      ctx!.fillStyle = "rgba(8,12,22,0.55)";
      ctx!.fillRect(0, 0, W, H);

      // ------------- 2. grade + sample grid -------------
      const cell = Math.max(3, CFG.cellSize * dpr);
      const cols = Math.ceil(W / cell), rows = Math.ceil(H / cell);
      const off = document.createElement("canvas");
      off.width = cols; off.height = rows;
      const data = grade(off, cols, rows).data;

      // ------------- 3. draw lines per cell -------------
      ctx!.strokeStyle = CFG.tint;
      ctx!.lineCap = "round";
      const skip = Math.max(1, Math.round(100 / Math.max(1, CFG.coverage * 8))); // sparse
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if ((x + y * 3) % skip !== 0) continue;
          const i = (y * cols + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          if (lum < 0.12) continue;

          // neighbour luminance -> direction (edgeEmphasis-ish)
          const iR = (y * cols + Math.min(cols - 1, x + 1)) * 4;
          const iD = (Math.min(rows - 1, y + 1) * cols + x) * 4;
          const gx = (0.299 * data[iR] + 0.587 * data[iR + 1] + 0.114 * data[iR + 2]) / 255 - lum;
          const gy = (0.299 * data[iD] + 0.587 * data[iD + 1] + 0.114 * data[iD + 2]) / 255 - lum;
          const ang = Math.atan2(gy, gx) + Math.PI / 2;

          const cx = x * cell + cell / 2, cy = y * cell + cell / 2;
          const len = cell * (0.6 + lum * 1.2);
          ctx!.globalAlpha = 0.25 + lum * 0.75;
          ctx!.lineWidth = Math.max(0.6, dpr * 0.9);
          ctx!.beginPath();
          ctx!.moveTo(cx - Math.cos(ang) * len / 2, cy - Math.sin(ang) * len / 2);
          ctx!.lineTo(cx + Math.cos(ang) * len / 2, cy + Math.sin(ang) * len / 2);
          ctx!.stroke();
        }
      }
      ctx!.globalAlpha = 1;

      // ------------- 4. post-fx: bloom (cheap) -------------
      ctx!.globalCompositeOperation = "lighter";
      ctx!.globalAlpha = CFG.pfx.bloom * 0.35;
      ctx!.filter = "blur(10px)";
      ctx!.drawImage(canvas!, 0, 0);
      ctx!.filter = "none";
      ctx!.globalAlpha = 1;
      ctx!.globalCompositeOperation = "source-over";

      // scan lines
      ctx!.globalAlpha = CFG.pfx.scanLines * 0.5;
      ctx!.fillStyle = "#000";
      for (let y = 0; y < H; y += 3 * dpr) ctx!.fillRect(0, y, W, dpr);
      ctx!.globalAlpha = 1;

      // halftone dots (subtle)
      ctx!.globalAlpha = CFG.pfx.halftone * 0.35;
      ctx!.fillStyle = "rgba(0,0,0,0.6)";
      const hs = 6 * dpr;
      for (let y = 0; y < H; y += hs) for (let x = 0; x < W; x += hs) {
        ctx!.beginPath(); ctx!.arc(x, y, 0.7 * dpr, 0, Math.PI * 2); ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // film grain
      const grainAlpha = CFG.pfx.filmGrain;
      if (grainAlpha > 0) {
        const gW = Math.floor(W / 2), gH = Math.floor(H / 2);
        const gImg = ctx!.createImageData(gW, gH);
        for (let i = 0; i < gImg.data.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          gImg.data[i] = v; gImg.data[i + 1] = v; gImg.data[i + 2] = v; gImg.data[i + 3] = 40 * grainAlpha;
        }
        const gc = document.createElement("canvas"); gc.width = gW; gc.height = gH;
        gc.getContext("2d")!.putImageData(gImg, 0, 0);
        ctx!.globalCompositeOperation = "overlay";
        ctx!.drawImage(gc, 0, 0, W, H);
        ctx!.globalCompositeOperation = "source-over";
      }

      // chromatic aberration edges
      ctx!.globalCompositeOperation = "screen";
      ctx!.globalAlpha = 0.15;
      ctx!.drawImage(canvas!, -CFG.pfx.chromatic * 0.05 * dpr, 0);
      ctx!.drawImage(canvas!, CFG.pfx.chromatic * 0.05 * dpr, 0);
      ctx!.globalCompositeOperation = "source-over";
      ctx!.globalAlpha = 1;

      // vignette
      const grd = ctx!.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.4, W / 2, H / 2, Math.max(W, H) * 0.75);
      grd.addColorStop(0, "rgba(0,0,0,0)");
      grd.addColorStop(1, `rgba(0,0,0,${0.75 * CFG.pfx.vignette})`);
      ctx!.fillStyle = grd; ctx!.fillRect(0, 0, W, H);

      ctx!.restore();
    }

    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <canvas
        ref={cRef}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          width: "100vw",
          height: "100vh",
        }}
      />
      {/* soft top gradient to keep text legible */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.18), transparent 60%), linear-gradient(180deg, rgba(10,15,30,0.15), rgba(10,15,30,0.35))",
        }}
      />
    </>
  );
}
