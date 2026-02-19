import { useEffect, useRef, type FC } from "react";
import { Transformer, Line, Text as KonvaText } from "react-konva";
import type { Shape } from "./Planner";
import { Transformer as TransformerType } from "konva/lib/shapes/Transformer";
import Konva from "konva";

type RightTriangle = {
  onChange: (changes: Shape) => void;
  isSelected: boolean;
  shapeProps: Shape;
  onSelect: () => void;
};

export const RightTriangle: FC<RightTriangle> = ({
  isSelected,
  shapeProps,
  onSelect,
  onChange,
}) => {
  const trRef = useRef<TransformerType>(null);
  const shapeRef = useRef<Konva.Line>(null);
  const textRef = useRef<Konva.Text>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
    }
  }, [isSelected]);

  // Default right triangle points (right angle at bottom right)
  const defaultPoints = [0, 0, 30, 30, 30, 0];

  const { text: _t, labelFontSize: _lf, ...lineProps } = shapeProps;

  // Compute label bounding box from points
  const pts = shapeProps.points || defaultPoints;
  const xs = pts.filter((_, i) => i % 2 === 0);
  const ys = pts.filter((_, i) => i % 2 === 1);
  const ptMinX = Math.min(...xs);
  const ptMaxX = Math.max(...xs);
  const ptMinY = Math.min(...ys);

  return (
    <>
      <Line
        draggable={isSelected && !shapeProps.locked}
        points={shapeProps.points || defaultPoints}
        closed
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...lineProps}
        fill={shapeProps.fill || "#000"}
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
            labelFontSize: Math.max(8, (shapeProps.labelFontSize || 14) * Math.min(scaleX, scaleY)),
          });
        }}
        onDragMove={(e) => {
          if (textRef.current) {
            textRef.current.x(e.target.x());
            textRef.current.y(e.target.y());
          }
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
      />
      <KonvaText
        ref={textRef}
        x={shapeProps.x}
        y={shapeProps.y}
        offsetX={250 - (ptMinX + ptMaxX) / 2}
        offsetY={-ptMinY + (shapeProps.labelFontSize || 14) + 4}
        width={500}
        wrap="none"
        rotation={shapeProps.rotation}
        text={shapeProps.text || ""}
        fontSize={shapeProps.labelFontSize || 14}
        fill="white"
        align="center"
        fontStyle="bold"
        name="shape-label"
        visible={!!shapeProps.text}
        onClick={(e) => { e.cancelBubble = true; }}
        onTap={(e) => { e.cancelBubble = true; }}
      />
      {isSelected && !shapeProps.locked && <Transformer ref={trRef} />}
    </>
  );
};
