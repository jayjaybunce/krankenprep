import { useEffect, useRef, type FC } from "react";
import { Transformer, Line } from "react-konva";
import type { Shape } from "../Plan";
import { Transformer as TransformerType } from "konva/lib/shapes/Transformer";
import Konva from "konva";

type Triangle = {
  onChange: (changes: Shape) => void;
  isSelected: boolean;
  shapeProps: Shape;
  onSelect: () => void;
};

export const Triangle: FC<Triangle> = ({
  isSelected,
  shapeProps,
  onSelect,
  onChange,
}) => {
  const trRef = useRef<TransformerType>(null);
  const shapeRef = useRef<Konva.Line>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
    }
  }, [isSelected]);

  // Default triangle points (equilateral, centered at origin)
  const defaultPoints = [0, -20, -17.32, 10, 17.32, 10];

  return (
    <>
      <Line
        draggable
        points={shapeProps.points || defaultPoints}
        fill={shapeProps.fill || "#000"}
        closed
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        id={shapeProps.id}
        name="shape"
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Apply the scale to the points
          const points = node.points();
          const newPoints = points.map((point, index) => {
            return index % 2 === 0 ? point * scaleX : point * scaleY;
          });

          // Reset scale
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            points: newPoints,
          });
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
      />
      {isSelected && !shapeProps.locked && <Transformer ref={trRef} />}
    </>
  );
};
