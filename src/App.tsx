import { useState, useRef } from "react";
import { getPaletteSync, type Color } from "colorthief";
import {
  Sparkles,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  ExternalLink,
  Code2,
  Palette,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { useApod } from "./hooks/useApod";

function hexToRgb(hex: string): string {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

export default function App() {
  const { data, loading } = useApod();
  const [colors, setColors] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const extractColors = () => {
    if (imgRef.current) {
      try {
        const palette = getPaletteSync(imgRef.current, { colorCount: 5 });

        if (palette) {
          const hexColors = palette.map((color: any) => color.hex);
          setColors(hexColors);
        }
      } catch (err) {
        console.error("Image cross-origin or extraction error", err);
      }
    }
  };

  const copyToClipboard = (hex: string) => {
    const tailwindClass = `bg-[${hex}]`;
    navigator.clipboard.writeText(tailwindClass);
    setCopied(tailwindClass);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-indigo-400 space-y-4">
        <Sparkles className="animate-ping" size={32} />
        <p className="font-mono text-sm tracking-widest uppercase">
          Establishing connection
        </p>
      </div>
    );
  }

  if (data?.media_type !== "image") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 p-10 text-center">
        <div className="">
          <h2 className="text-2xl font-bold mb-2">Today's APOD is a Video</h2>
          <p>
            Color extraction requires a static image. Please check back
            tomorrow! :D{" "}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex items-end justify-between border-b border-white/10 pb-6">
          <h1>
            <Sparkles className="text-indigo-400" />
            Cosmic Palette
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            NASA APOD Tailwind Gen
          </p>
        </header>

        {/* LEFT COLUMN - IMAGES AND DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black relative group">
              <img
                ref={imgRef}
                src={data.url}
                alt={data.title}
                crossOrigin="anonymous"
                onLoad={extractColors}
                className="w-full h-auto object-contain max h-[600px] bg-slate-900"
              />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-white mb-3 tracking-tight">
                {data.title}
              </h2>
              <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                <p className="text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                  {data.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN PALETTE */}
        <div className="lg:col-span-5 flex flex-col">
          <h3 className="text-sm font-mono tracking-widest text-slate-400 uppercase mb-6 flex items-center gap-2">
            <span className="w-8 h-px bg-slate-700">Extracted Swatches</span>
          </h3>

          {colors.length === 0 ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-white/5 rounded-xl border border-white/5"
                ></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {colors.map((hex, index) => (
                <button
                  key={index}
                  onClick={() => copyToClipboard(hex)}
                  className="w-full group relative flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:scale-[1.02] border border-white/5 hover:border-white/20 text-left"
                  style={{ backgroundColor: `${hex}15` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-lg shadow-inner border border-white/20 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: hex }}
                    />
                    <div>
                      <p className="text-lg font-mono font-bold text-white uppercase tracking-wider">
                        {hex}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-1 opacity-80 group-hover:opacity-100">
                        bg-[{hex}]
                      </p>
                    </div>
                  </div>

                  <div className="pr-4 text-slate-400 group-hover:text-white transition-colors">
                    {copied === `bg-[${hex}]` ? (
                      <span className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-md text-emerald-400">
                        Copied
                      </span>
                    ) : (
                      <Copy
                        size={18}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {colors.length > 0 && (
            <div className="mt-8 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
              <p className="text-xs text-indigo-300/80 leading-relaxed">
                Click any swatch to copy it's arbitrary Tailwind class to your
                clipboard :D
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
