import { type FC, useState, useRef, useEffect } from "react";

type Brick = {
  id: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
};

export type BrickDisplacementImageProps = {
  imageUrl: string;
  className?: string;
  brickSize?: number;
  spreadDistance?: number;
  spreadForce?: number;
};

export const BrickDisplacementImage: FC<BrickDisplacementImageProps> = ({
  imageUrl,
  className = "",
  brickSize = 20,
  spreadDistance = 80,
  spreadForce = 30,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Initialize bricks grid
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.offsetWidth;
    const height = container.offsetHeight;

    setContainerSize({ width, height });

    const cols = Math.ceil(width / brickSize);
    const rows = Math.ceil(height / brickSize);

    const newBricks: Brick[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newBricks.push({
          id: row * cols + col,
          x: col * brickSize,
          y: row * brickSize,
          offsetX: 0,
          offsetY: 0,
        });
      }
    }
    setBricks(newBricks);
  }, [imageUrl, brickSize]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate brick displacements
    setBricks((prevBricks) =>
      prevBricks.map((brick) => {
        const brickCenterX = brick.x + brickSize / 2;
        const brickCenterY = brick.y + brickSize / 2;

        const dx = brickCenterX - x;
        const dy = brickCenterY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < spreadDistance && distance > 0) {
          const force = (spreadDistance - distance) / spreadDistance;
          const offsetX = (dx / distance) * force * spreadForce;
          const offsetY = (dy / distance) * force * spreadForce;

          return { ...brick, offsetX, offsetY };
        }

        // Smoothly return to original position
        return {
          ...brick,
          offsetX: brick.offsetX * 0.9,
          offsetY: brick.offsetY * 0.9,
        };
      })
    );
  };

  const handleMouseLeave = () => {
    setBricks((prevBricks) =>
      prevBricks.map((brick) => ({ ...brick, offsetX: 0, offsetY: 0 }))
    );
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{
        backgroundColor: "#1a1a1a",
      }}
    >
      {bricks.map((brick) => (
        <div
          key={brick.id}
          className="absolute"
          style={{
            left: brick.x,
            top: brick.y,
            width: brickSize,
            height: brickSize,
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: `-${brick.x}px -${brick.y}px`,
            backgroundSize: `${containerSize.width}px ${containerSize.height}px`,
            transform: `translate(${brick.offsetX}px, ${brick.offsetY}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      ))}
    </div>
  );
};

export default BrickDisplacementImage;
