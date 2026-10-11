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

function isDarkColor(hex: string): boolean {
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

  // Set ambient dynamic background glow
  useEffect(() => {
    const dominant = colors[0] || "#6366f1";
    document.documentElement.style.setProperty(
      "--dominant-glow",
      `${dominant}35`,
    );
  }, [colors]);

  // Copy helper
  const copyValue = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedItem(value);
    setToastMessage(`Copied: ${label}`);
    setTimeout(() => {
      setCopiedItem(null);
      setToastMessage(null);
    }, 2200);
  };

  // Clean explanation text
  const cleanExplanation = data?.explanation
    ? data.explanation
        .replace(/<[^>]*>/g, "")
        .replace(/^Explanation:\s*/i, "")
        .trim()
    : "";

  // Clean credit
  const cleanCredit =
    data?.copyright || data?.credit
      ? (data.copyright || data.credit || "").replace(/<[^>]*>/g, "").trim()
      : null;

  // Export helpers
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
      {/* Background Ambience */}
      <div className="cosmic-background">
        <div className="cosmic-stars" />
      </div>

      <div className="app-container">
        {/* Header Bar */}
        <header className="app-header">
          <div className="brand-wrapper">
            <div className="brand-logo-icon">
              <Palette size={24} />
            </div>
            <div>
              <h1 className="brand-title">Cosmic Palette</h1>
              <p className="brand-tagline">NASA APOD Color & Tailwind Engine</p>
            </div>
          </div>

          {/* Navigation Controls */}
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
              aria-label="Next APOD"
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

        {/* Main 2-Column Responsive Layout */}
        <main className="main-grid">
          {/* LEFT: Featured Image & Information */}
          <div className="hero-image-card glass-panel">
            {data?.media_type === "image" ? (
              <div
                className="image-preview-viewport"
                onClick={() => setIsLightboxOpen(true)}
                title="Click to view fullscreen image"
              >
                <img
                  ref={imgRef}
                  src={data.hdurl || data.url}
                  alt={data.title}
                  crossOrigin="anonymous"
                  onLoad={() => extractColors()}
                  className="apod-hero-img"
                />

                <div className="image-overlay-actions">
                  <button
                    className="overlay-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                  >
                    <Maximize2 size={13} />
                    Fullscreen
                  </button>
                  <a
                    href={data.hdurl || data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="overlay-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={13} />
                    Original HD
                  </a>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "4rem 2rem",
                  textAlign: "center",
                  background: "rgba(0,0,0,0.3)",
                }}
              >
                <Palette
                  size={48}
                  style={{
                    color: "var(--accent-purple)",
                    marginBottom: "1rem",
                  }}
                />
                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                  Today's APOD is a Video
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    maxWidth: "420px",
                    margin: "0 auto",
                  }}
                >
                  Color extraction requires a static photo. Use the header
                  arrows above to explore recent photographic APODs!
                </p>
              </div>
            )}

            <div className="image-meta-bar">
              <div className="image-title-row">
                <h2 className="image-title">{data?.title}</h2>
              </div>

              {cleanCredit && (
                <div className="image-credit-tag">
                  <span>Image Credit & Copyright:</span>
                  <strong>{cleanCredit}</strong>
                </div>
              )}

              {cleanExplanation && (
                <div className="explanation-box">
                  <p
                    className={`explanation-text ${isExpanded ? "expanded" : ""}`}
                  >
                    {cleanExplanation}
                  </p>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="expand-toggle-btn"
                  >
                    {isExpanded ? "Show less" : "Read full description"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Cosmic Palette Studio */}
          <div className="palette-studio-card glass-panel">
            <div className="studio-header">
              <div className="studio-header-title">
                <SlidersHorizontal size={20} color="var(--accent-cyan)" />
                <span>Extracted Swatches</span>
              </div>

              {/* Color Count Filter */}
              <div className="count-selector-group">
                {[5, 8, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleColorCountChange(num)}
                    className={`count-btn ${colorCount === num ? "active" : ""}`}
                  >
                    {num} Colors
                  </button>
                ))}
              </div>
            </div>

            {/* Quick format selector pills */}
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Default Format:
              </span>
              {(["tailwind", "hex", "rgb"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setActiveTab(fmt)}
                  className={`count-btn ${activeTab === fmt ? "active" : ""}`}
                  style={{ textTransform: "uppercase" }}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Swatch Cards Grid */}
            <div className="swatches-grid">
              {colors.length === 0 ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <p style={{ fontSize: "0.9rem" }}>
                    Extracting astronomical swatches...
                  </p>
                </div>
              ) : (
                colors.map((hex, index) => {
                  const tailwindClass = `bg-[${hex}]`;
                  const rgbValue = hexToRgb(hex);
                  const isDark = isDarkColor(hex);

                  let primaryCopyValue = tailwindClass;
                  if (activeTab === "hex") primaryCopyValue = hex;
                  if (activeTab === "rgb") primaryCopyValue = rgbValue;

                  return (
                    <div
                      key={index}
                      className="swatch-card"
                      onClick={() =>
                        copyValue(primaryCopyValue, primaryCopyValue)
                      }
                      style={{
                        background: `linear-gradient(90deg, ${hex}18 0%, rgba(15, 23, 42, 0.6) 100%)`,
                        borderColor: `${hex}30`,
                        cursor: "pointer",
                      }}
                      title={`Click to copy ${primaryCopyValue}`}
                    >
                      <div className="swatch-left">
                        <div
                          className="swatch-color-box"
                          style={{
                            backgroundColor: hex,
                            boxShadow: `0 6px 18px -2px ${hex}60`,
                          }}
                        />
                        <div className="swatch-details">
                          <span className="swatch-hex">{hex}</span>
                          <div className="swatch-tailwind-token">
                            <span>{tailwindClass}</span>
                            <span
                              className="swatch-contrast-pill"
                              style={{
                                backgroundColor: isDark
                                  ? "rgba(255,255,255,0.12)"
                                  : "rgba(0,0,0,0.5)",
                                color: isDark ? "#ffffff" : "#f1f5f9",
                              }}
                            >
                              {isDark ? "Light Text" : "Dark Text"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div
                        className="swatch-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            copyValue(tailwindClass, tailwindClass)
                          }
                          className={`action-chip-btn ${copiedItem === tailwindClass ? "copied" : ""}`}
                          title="Copy Tailwind class"
                        >
                          {copiedItem === tailwindClass ? (
                            <Check size={12} />
                          ) : (
                            <Copy size={12} />
                          )}
                          TW
                        </button>

                        <button
                          onClick={() => copyValue(hex, hex)}
                          className={`action-chip-btn ${copiedItem === hex ? "copied" : ""}`}
                          title="Copy HEX code"
                        >
                          {copiedItem === hex ? (
                            <Check size={12} />
                          ) : (
                            <Copy size={12} />
                          )}
                          HEX
                        </button>

                        <button
                          onClick={() => copyValue(rgbValue, rgbValue)}
                          className={`action-chip-btn ${copiedItem === rgbValue ? "copied" : ""}`}
                          title="Copy RGB value"
                        >
                          {copiedItem === rgbValue ? (
                            <Check size={12} />
                          ) : (
                            <Copy size={12} />
                          )}
                          RGB
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bulk Export Options */}
            {colors.length > 0 && (
              <div className="export-section">
                <span className="export-section-title">
                  Bulk Export Palette
                </span>
                <div className="export-buttons-row">
                  <button onClick={exportAllTailwind} className="export-btn">
                    <Code2 size={14} />
                    Tailwind
                  </button>
                  <button onClick={exportAllCssVars} className="export-btn">
                    <Palette size={14} />
                    CSS Vars
                  </button>
                  <button onClick={exportAllJson} className="export-btn">
                    <Copy size={14} />
                    JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && data && (
        <div
          className="lightbox-backdrop"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox-close-btn"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close fullscreen view"
            >
              <X size={20} />
            </button>
            <img
              src={data.hdurl || data.url}
              alt={data.title}
              className="lightbox-img"
            />
            <p
              style={{
                marginTop: "1rem",
                color: "#e2e8f0",
                fontSize: "1rem",
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {data.title} — {data.date}
            </p>
          </div>
        </div>
      )}

      {/* Copied Toast Notification */}
      {toastMessage && (
        <div className="cosmic-toast">
          <Check size={16} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
