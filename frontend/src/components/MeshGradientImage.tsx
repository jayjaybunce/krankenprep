import { type FC, useState, useRef } from "react";

export type MeshGradientImageProps = {
  imageUrl: string;
  className?: string;
  intensity?: number;
  colorScheme?: "purple" | "blue" | "pink" | "teal" | "orange";
};

export const MeshGradientImage: FC<MeshGradientImageProps> = ({
  imageUrl,
  className = "",
  intensity = 0.6,
  colorScheme = "purple",
}) => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0.5, y: 0.5 });
  };

  // Color schemes for the mesh gradient
  const colorSchemes = {
    purple: {
      color1: "rgba(147, 51, 234, 0.8)", // purple-600
      color2: "rgba(236, 72, 153, 0.7)", // pink-500
      color3: "rgba(59, 130, 246, 0.6)", // blue-500
      color4: "rgba(168, 85, 247, 0.7)", // purple-500
    },
    blue: {
      color1: "rgba(59, 130, 246, 0.8)", // blue-500
      color2: "rgba(14, 165, 233, 0.7)", // sky-500
      color3: "rgba(99, 102, 241, 0.6)", // indigo-500
      color4: "rgba(34, 211, 238, 0.7)", // cyan-400
    },
    pink: {
      color1: "rgba(236, 72, 153, 0.8)", // pink-500
      color2: "rgba(251, 113, 133, 0.7)", // rose-400
      color3: "rgba(244, 114, 182, 0.6)", // pink-400
      color4: "rgba(249, 168, 212, 0.7)", // pink-300
    },
    teal: {
      color1: "rgba(20, 184, 166, 0.8)", // teal-500
      color2: "rgba(6, 182, 212, 0.7)", // cyan-500
      color3: "rgba(34, 211, 238, 0.6)", // cyan-400
      color4: "rgba(45, 212, 191, 0.7)", // teal-400
    },
    orange: {
      color1: "rgba(249, 115, 22, 0.8)", // orange-500
      color2: "rgba(251, 146, 60, 0.7)", // orange-400
      color3: "rgba(253, 186, 116, 0.6)", // orange-300
      color4: "rgba(234, 88, 12, 0.7)", // orange-600
    },
  };

  const colors = colorSchemes[colorScheme];

  // Calculate gradient stop positions based on mouse position
  const getGradientStops = () => {
    const baseX = mousePos.x * 100;
    const baseY = mousePos.y * 100;

    return {
      stop1: { x: baseX * 0.8, y: baseY * 0.8 },
      stop2: { x: 100 - baseX * 0.6, y: baseY * 1.2 },
      stop3: { x: baseX * 1.2, y: 100 - baseY * 0.7 },
      stop4: { x: 100 - baseX * 0.9, y: 100 - baseY * 0.9 },
    };
  };

  const stops = getGradientStops();

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Base image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
      />

      {/* Mesh gradient overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "overlay" }}>
        <defs>
          <radialGradient id="grad1" cx={`${stops.stop1.x}%`} cy={`${stops.stop1.y}%`} r="50%">
            <stop offset="0%" stopColor={colors.color1} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="grad2" cx={`${stops.stop2.x}%`} cy={`${stops.stop2.y}%`} r="60%">
            <stop offset="0%" stopColor={colors.color2} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="grad3" cx={`${stops.stop3.x}%`} cy={`${stops.stop3.y}%`} r="55%">
            <stop offset="0%" stopColor={colors.color3} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="grad4" cx={`${stops.stop4.x}%`} cy={`${stops.stop4.y}%`} r="45%">
            <stop offset="0%" stopColor={colors.color4} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#grad1)" style={{ transition: "all 0.5s ease-out" }} />
        <rect width="100%" height="100%" fill="url(#grad2)" style={{ transition: "all 0.6s ease-out" }} />
        <rect width="100%" height="100%" fill="url(#grad3)" style={{ transition: "all 0.7s ease-out" }} />
        <rect width="100%" height="100%" fill="url(#grad4)" style={{ transition: "all 0.8s ease-out" }} />
      </svg>

      {/* Additional soft glow at cursor position */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255, 255, 255, ${intensity * 0.3}) 0%, transparent 40%)`,
          transition: "background 0.4s ease-out",
          mixBlendMode: "soft-light",
        }}
      />
    </div>
  );
};

export default MeshGradientImage;
