import { type FC, useState, useEffect, useRef } from "react";

type Bubble = {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
};

export type BubbleRevealImageProps = {
  imageUrl: string;
  className?: string;
  bubbleCount?: number;
  minBubbleSize?: number;
  maxBubbleSize?: number;
  bubbleSpeed?: number;
};

export const BubbleRevealImage: FC<BubbleRevealImageProps> = ({
  imageUrl,
  className = "",
  bubbleCount = 15,
  minBubbleSize = 40,
  maxBubbleSize = 120,
  bubbleSpeed = 1,
}) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(null);

  // Initialize bubbles
  useEffect(() => {
    if (!containerRef.current) return;

    const containerHeight = containerRef.current.offsetHeight;
    const containerWidth = containerRef.current.offsetWidth;

    const initialBubbles: Bubble[] = Array.from(
      { length: bubbleCount },
      (_, i) => ({
        id: i,
        x: Math.random() * containerWidth,
        y: containerHeight + Math.random() * 200, // Start below container
        size: minBubbleSize + Math.random() * (maxBubbleSize - minBubbleSize),
        speed: bubbleSpeed * (0.5 + Math.random() * 0.5), // Vary speed
        opacity: 0.7 + Math.random() * 0.3,
      }),
    );

    setBubbles(initialBubbles);
  }, [bubbleCount, minBubbleSize, maxBubbleSize, bubbleSpeed]);

  // Animate bubbles
  useEffect(() => {
    if (!containerRef.current || bubbles.length === 0) return;

    const containerHeight = containerRef.current.offsetHeight;
    const containerWidth = containerRef.current.offsetWidth;

    const animate = () => {
      setBubbles((prevBubbles) =>
        prevBubbles.map((bubble) => {
          const newY = bubble.y - bubble.speed;

          // Reset bubble to bottom when it goes off screen
          if (newY + bubble.size < 0) {
            return {
              ...bubble,
              y: containerHeight + bubble.size,
              x: Math.random() * containerWidth,
              size:
                minBubbleSize + Math.random() * (maxBubbleSize - minBubbleSize),
              speed: bubbleSpeed * (0.5 + Math.random() * 0.5),
            };
          }

          return {
            ...bubble,
            y: newY,
          };
        }),
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bubbles.length, minBubbleSize, maxBubbleSize, bubbleSpeed]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Theme-aware background */}
      <div className="absolute inset-0 dark:bg-neutral-950 bg-neutral-50" />

      {/* SVG mask layer that reveals the image through bubbles */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="bubble-mask">
            {/* Black background (hides everything) */}
            <rect width="100%" height="100%" fill="black" />
            {/* White circles (reveals image) */}
            {bubbles.map((bubble) => (
              <circle
                key={bubble.id}
                cx={bubble.x}
                cy={bubble.y}
                r={bubble.size / 2}
                fill="white"
                opacity={bubble.opacity}
              />
            ))}
          </mask>
        </defs>

        {/* Image revealed through the mask */}
        <image
          href={imageUrl}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          mask="url(#bubble-mask)"
        />
      </svg>

      {/* Optional: Add bubble outlines for visual effect */}
      {bubbles.map((bubble) => (
        <div
          key={`outline-${bubble.id}`}
          className="absolute rounded-full border border-cyan-400/20"
          style={{
            left: bubble.x - bubble.size / 2,
            top: bubble.y - bubble.size / 2,
            width: bubble.size,
            height: bubble.size,
            opacity: bubble.opacity * 0.5,
          }}
        />
      ))}
    </div>
  );
};

export default BubbleRevealImage;
