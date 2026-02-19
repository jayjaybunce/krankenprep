import { useEffect, useRef, type FC } from "react";
import { Image as KonvaImage, Transformer, Text as KonvaText } from "react-konva";
import type { Shape } from "./Planner";
import useImage from "use-image";
import { Transformer as TransformerType } from "konva/lib/shapes/Transformer";
import Konva from "konva";

type ImageProps = {
  onChange: (changes: Shape) => void;
  isSelected: boolean;
  shapeProps: Shape;
  onSelect: () => void;
  src: string;
};

export const Image: FC<ImageProps> = ({
  isSelected,
  shapeProps,
  onSelect,
  onChange,
  src,
}) => {
  const trRef = useRef<TransformerType>(null);
  const shapeRef = useRef<Konva.Image>(null);
  const textRef = useRef<Konva.Text>(null);
  const [image] = useImage(src, "anonymous");

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
    }
  }, [isSelected]);

  // Remove src, type, text, and labelFontSize from props to avoid passing them to KonvaImage
  const { src: _src, type: _type, text: _t, labelFontSize: _lf, ...restProps } = shapeProps;
  const imgProps = { ...restProps, fill: "" };

  return (
    <>
      <KonvaImage
        image={image}
        draggable={isSelected && !shapeProps.locked}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...imgProps}
        id={shapeProps.id}
        name="shape"
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
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
        offsetX={250 - (shapeProps.width || 40) / 2}
        offsetY={(shapeProps.labelFontSize || 14) + 4}
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
