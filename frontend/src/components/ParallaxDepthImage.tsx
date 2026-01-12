import { type FC, useState, useRef } from "react";

export type ParallaxDepthImageProps = {
  imageUrl: string;
  className?: string;
  layers?: number;
  intensity?: number;
  backgroundPosition?: string;
  title?: React.ReactNode;
  subtitles?: React.ReactNode[];
};

export const ParallaxDepthImage: FC<ParallaxDepthImageProps> = ({
  imageUrl,
  className = "",
  layers = 5,
  intensity = 20,
  backgroundPosition = "center",
  title,
  subtitles = [],
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

  // Generate layer configurations
  const layerConfigs = Array.from({ length: layers }, (_, i) => {
    const depth = (i + 1) / layers;
    const offsetX = (mousePos.x - 0.5) * intensity * depth;
    const offsetY = (mousePos.y - 0.5) * intensity * depth;
    const scale = 1 + depth * 0.1; // Slight scale increase for depth
    const brightness = 1 - depth * 0.3; // Darken background layers
    const blur = depth * 2; // Slight blur for background layers

    return {
      offsetX,
      offsetY,
      scale,
      brightness,
      blur,
      zIndex: layers - i,
    };
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {layerConfigs.map((config, index) => (
        <div
          key={index}
          className="absolute inset-0"
          style={{
            transform: `translate(${config.offsetX}px, ${config.offsetY}px) scale(${config.scale})`,
            filter: `brightness(${config.brightness}) blur(${config.blur}px)`,
            transition: "transform 0.3s ease-out, filter 0.3s ease-out",
            zIndex: config.zIndex,
          }}
        >
          <div
            className="w-full h-full bg-cover"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: backgroundPosition,
            }}
          />
        </div>
      ))}

      {/* Overlay gradient for additional depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, transparent 0%, rgba(0,0,0,0.1) 100%)`,
          transition: "background 0.3s ease-out",
          zIndex: layers + 1,
        }}
      />

      {/* Title and subtitles with parallax effect */}
      {(title || subtitles.length > 0) && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3"
          style={{
            transform: `translate(${(mousePos.x - 0.5) * intensity * 0.5}px, ${(mousePos.y - 0.5) * intensity * 0.5}px)`,
            transition: "transform 0.3s ease-out",
            zIndex: layers + 2,
          }}
        >
          {title && (
            <div className="pointer-events-auto backdrop-blur-sm bg-black/10 dark:bg-white/5 rounded-2xl px-6 py-4">
              {title}
            </div>
          )}
          {subtitles.map((subtitle, index) => (
            <div
              key={index}
              className="pointer-events-auto backdrop-blur-sm bg-black/10 dark:bg-white/5 rounded-2xl px-6 py-4"
            >
              {subtitle}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParallaxDepthImage;
