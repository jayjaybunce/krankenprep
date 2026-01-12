import { type FC, useState, useRef, useEffect } from "react";

type GlitchBlock = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  offsetX: number;
  active: boolean;
};

export type PixelGlitchImageProps = {
  imageUrl: string;
  className?: string;
  glitchIntensity?: number;
  scanlineSpeed?: number;
  pixelBlockSize?: number;
};

export const PixelGlitchImage: FC<PixelGlitchImageProps> = ({
  imageUrl,
  className = "",
  glitchIntensity = 0.3,
  scanlineSpeed = 2,
  pixelBlockSize = 40,
}) => {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [glitchBlocks, setGlitchBlocks] = useState<GlitchBlock[]>([]);
  const [scanlinePos, setScanlinePos] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const GLITCH_RADIUS = 100; // Pixels around cursor that glitch

  // Initialize glitch blocks
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    const cols = Math.ceil(width / pixelBlockSize);
    const rows = Math.ceil(height / pixelBlockSize);

    const blocks: GlitchBlock[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        blocks.push({
          id: row * cols + col,
          x: col * pixelBlockSize,
          y: row * pixelBlockSize,
          width: pixelBlockSize,
          height: pixelBlockSize,
          offsetX: 0,
          active: false,
        });
      }
    }
    setGlitchBlocks(blocks);
  }, [pixelBlockSize]);

  // Animate scanline
  useEffect(() => {
    const animate = () => {
      setScanlinePos((prev) => {
        if (!containerRef.current) return prev;
        const height = containerRef.current.offsetHeight;
        return (prev + scanlineSpeed) % height;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scanlineSpeed]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    // Update glitch blocks based on cursor proximity
    setGlitchBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        const blockCenterX = block.x + block.width / 2;
        const blockCenterY = block.y + block.height / 2;

        const dx = blockCenterX - x;
        const dy = blockCenterY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < GLITCH_RADIUS) {
          const intensity = (GLITCH_RADIUS - distance) / GLITCH_RADIUS;
          const glitchOffset = (Math.random() - 0.5) * intensity * 20 * glitchIntensity;

          return {
            ...block,
            offsetX: glitchOffset,
            active: Math.random() > 0.7, // Random activation
          };
        }

        // Gradually return to normal
        return {
          ...block,
          offsetX: block.offsetX * 0.9,
          active: false,
        };
      })
    );
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
    setGlitchBlocks((prevBlocks) =>
      prevBlocks.map((block) => ({ ...block, offsetX: 0, active: false }))
    );
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Base image layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      />

      {/* Glitch blocks layer */}
      <div className="absolute inset-0">
        {glitchBlocks.map((block) => (
          <div
            key={block.id}
            className="absolute overflow-hidden"
            style={{
              left: block.x,
              top: block.y,
              width: block.width,
              height: block.height,
              transform: `translateX(${block.offsetX}px)`,
              transition: "transform 0.05s linear",
            }}
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: `-${block.x}px -${block.y}px`,
                backgroundSize: `${containerRef.current?.offsetWidth || 0}px ${containerRef.current?.offsetHeight || 0}px`,
                filter: block.active ? "hue-rotate(180deg) saturate(2)" : "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Chromatic aberration effect near cursor */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: mousePos.x - GLITCH_RADIUS,
          top: mousePos.y - GLITCH_RADIUS,
          width: GLITCH_RADIUS * 2,
          height: GLITCH_RADIUS * 2,
          background: `radial-gradient(circle, rgba(255, 0, 0, ${glitchIntensity * 0.2}) 0%, transparent 70%)`,
          mixBlendMode: "screen",
          transition: "opacity 0.1s",
          opacity: mousePos.x > 0 ? 1 : 0,
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          left: mousePos.x - GLITCH_RADIUS + 2,
          top: mousePos.y - GLITCH_RADIUS,
          width: GLITCH_RADIUS * 2,
          height: GLITCH_RADIUS * 2,
          background: `radial-gradient(circle, rgba(0, 255, 255, ${glitchIntensity * 0.2}) 0%, transparent 70%)`,
          mixBlendMode: "screen",
          transition: "opacity 0.1s",
          opacity: mousePos.x > 0 ? 1 : 0,
        }}
      />

      {/* Scanline effect */}
      <div
        className="absolute left-0 right-0 h-1 pointer-events-none"
        style={{
          top: scanlinePos,
          background: "linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent)",
          boxShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
        }}
      />

      {/* Subtle horizontal scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.05) 2px, rgba(0, 0, 0, 0.05) 4px)",
          opacity: 0.3,
        }}
      />
    </div>
  );
};

export default PixelGlitchImage;
