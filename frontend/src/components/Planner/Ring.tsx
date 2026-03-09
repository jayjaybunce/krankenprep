import { useEffect, useRef, type FC } from "react";
import { Transformer, Ring as KonvaRing, Text as KonvaText } from "react-konva";
import type { Shape } from "./Planner";
import { Transformer as TransformerType } from "konva/lib/shapes/Transformer";
import Konva from "konva";

type RingProps = {
  onChange: (changes: Shape) => void;
  isSelected: boolean;
  shapeProps: Shape;
  onSelect: () => void;
};

export const Ring: FC<RingProps> = ({
  isSelected,
  shapeProps,
  onSelect,
  onChange,
}) => {
  const trRef = useRef<TransformerType>(null);
  const shapeRef = useRef<Konva.Ring>(null);
  const textRef = useRef<Konva.Text>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
    }
  }, [isSelected]);

  const outerRadius = shapeProps.radiusX || 40;
  const ringWidth = shapeProps.ringWidth ?? 10;
  const innerRadius = Math.max(1, outerRadius - ringWidth);

  const {
    text: _t,
    labelFontSize: _lf,
    height: _h,
    width: _w,
    ringWidth: _rw,
    radiusX: _rx,
    radiusY: _ry,
    src: _src,
    points: _pts,
    ...ringProps
  } = shapeProps;

  return (
    <>
      <KonvaRing
        draggable={isSelected && !shapeProps.locked}
        outerRadius={outerRadius}
        innerRadius={innerRadius}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...ringProps}
        fill={shapeProps.fill === "transparent" ? "transparent" : (shapeProps.fill || "#fff")}
        id={shapeProps.id}
        name="shape"
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          const scale = Math.min(scaleX, scaleY);

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            radiusX: Math.max(5, outerRadius * scale),
            ringWidth: Math.max(2, ringWidth * scale),
            labelFontSize: Math.max(8, (shapeProps.labelFontSize || 14) * scale),
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
        offsetY={outerRadius + (shapeProps.labelFontSize || 14) + 4}
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
