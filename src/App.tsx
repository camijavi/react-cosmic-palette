import { useState, useRef, useEffect } from "react";
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

function isDakColor(hex: string): boolean {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 135;
}

export default function App() {
  const { data, loading, error, currentIndex, totalItems, nextApod, prevApod } =
    useApod();

  const [colorCount, setColorCount] = useState<number>(5);
  const [colors, setColors] = useState<string[]>([]);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"tailwind" | "hex" | "rgb">(
    "tailwind",
  );

  const imgRef = useRef<HTMLImageElement>(null);

  const extractColors = (count = colorCount) => {
    if (
      imgRef.current &&
      imgRef.current.complete &&
      imgRef.current.naturalWidth > 0
    ) {
      try {
        const palette = getPaletteSync(imgRef.current, { colorCount: count });
        if (palette && palette.length > 0) {
          const hexList = palette.map((color: Color) => color.hex());
          setColors(hexList);
        }
      } catch (err) {
        console.warn("Color extraction notice:", err);
      }
    }
  };

  const handleColorCountChange = (count: number) => {
    setColorCount(count);
    extractColors(count);
  };

  useEffect(() => {
    const dominant = colors[0] || "#6366f1";
    document.documentElement.style.setProperty(
      "--dominant-glow",
      `${dominant}35`,
    );
  }, [colors]);

  const copyValue = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedItem(value);
    setToastMessage(`Copied: ${label}`);
    setTimeout(() => {
      setCopiedItem(null);
      setToastMessage(null);
    }, 2200);
  };

  const cleanCredit =
    data?.copyright || data?.credit
      ? (data.copyright || data.credit || "").replace(/<[^>]*>/g, "").trim()
      : null;

  const exportAllTailwind = () => {
    const classes = colors.map((c) => `bg-[${c}]`).join(" ");
    copyValue(classes, "All Tailwind Classes");
  };

  const exportAllCssVars = () => {
    const css = colors.map((c, i) => `  --cosmic-${i + 1}: ${c};`).join("\n");
    copyValue(`:root {\n${css}\n}`, "CSS Custom Properties");
  };

  const exportAllJson = () => {
    const json = JSON.stringify(colors, null, 2);
    copyValue(json, "Palette JSON");
  };

  if (loading && !data) {
    return (
      <div className="cosmic-background">
        <div className="cosmic-stars" />
        <div className="loading-viewport">
          <div className="loading-spinner-orb">
            <Sparkles size={28} color="white" />
          </div>
          <p className="loading-text">Establishing Deep Space Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="cosmic-background">
        <div className="cosmic-stars" />
      </div>

      <div className="app-container">
        <header className="app-header">
          <div className="brand-wrapper">
            <div className="brand-logo-icon">
              <Sparkles size={24} />
            </div>
            <div className="">
              <h1 className="brand-title">Cosmic Palette</h1>
              <p className="brand-engine">NASA APOD Color & Tailwind Engine</p>
            </div>
          </div>

          <div className="apod-nav-controls">
            <button
              onClick={prevApod}
              disabled={currentIndex === 0}
              className="nav-arrow-btn"
              title="Previous recent APOD"
              aria-label="Previous APOD"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="date-pill">
              <span>{data?.date || "Today"}</span>
              {currentIndex === 0 && (
                <span className="badge-live">
                  <span className="badge-live-dot" />
                  Latest
                </span>
              )}
            </div>

            <button
              onClick={nextApod}
              disabled={currentIndex >= totalItems - 1}
              className="nav-arrow-btn"
              title="Next recent APOD"
              aria-label="Next-APOD"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </header>

        {error && (
          <div
            className="glass-panel"
            style={{
              padding: "1rem 1.5rem",
              borderColor: "rgba(239, 68, 68, 0.4)",
            }}
          >
            <p style={{ color: "#f87171", fontSize: "0.9rem" }}>{error}</p>
          </div>
        )}
      </div>
    </>
  );
}
