import { useEffect, useRef, type FC } from "react";
import { Transformer, Ellipse } from "react-konva";
import type { Shape } from "./Planner";
import { Transformer as TransformerType } from "konva/lib/shapes/Transformer";
import Konva from "konva";

type CircleProps = {
  onChange: (changes: Shape) => void;
  isSelected: boolean;
  shapeProps: Shape;
  onSelect: () => void;
};

export const Circle: FC<CircleProps> = ({
  isSelected,
  shapeProps,
  onSelect,
  onChange,
}) => {
  const trRef = useRef<TransformerType>(null);
  const shapeRef = useRef<Konva.Ellipse>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
    }
  }, [isSelected]);

  const refinedProps = { ...shapeProps };
  delete refinedProps["height"];
  delete refinedProps["width"];

  return (
    <>
      <Ellipse
        draggable={isSelected && !shapeProps.locked}
        radiusX={shapeProps.radiusX || 20}
        radiusY={shapeProps.radiusY || 20}
        fill={shapeProps.fill || "#000"}
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

          // Apply scale to radii
          const radiusX = (shapeProps.radiusX || 20) * scaleX;
          const radiusY = (shapeProps.radiusY || 20) * scaleY;

          // Reset scale
          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            radiusX: Math.max(5, radiusX),
            radiusY: Math.max(5, radiusY),
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
      {isSelected && !shapeProps.locked && <Transformer ref={trRef} flipEnabled={false} />}
    </>
  );
};
