import { useEffect, useRef, type FC } from "react";
import { Transformer, Ellipse, Text as KonvaText } from "react-konva";
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
  const textRef = useRef<Konva.Text>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
    }
  }, [isSelected]);

  const { text: _t, labelFontSize: _lf, height: _h, width: _w, ...ellipseProps } = shapeProps;

  return (
    <>
      <Ellipse
        draggable={isSelected && !shapeProps.locked}
        radiusX={shapeProps.radiusX || 20}
        radiusY={shapeProps.radiusY || 20}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...ellipseProps}
        fill={shapeProps.fill || "#000"}
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
        offsetX={250}
        offsetY={(shapeProps.radiusY || 20) + (shapeProps.labelFontSize || 14) + 4}
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
      {isSelected && !shapeProps.locked && <Transformer ref={trRef} flipEnabled={false} />}
    </>
  );
};
