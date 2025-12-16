import { useEffect, useRef, type FC } from "react";
import { Rect, Transformer } from "react-konva";
import type { Shape } from "../Plan";
import { Transformer as TransformerType } from "konva/lib/shapes/Transformer";
import Konva from "konva";

type RectangleProps = {
  onChange: (changes: Shape) => void;
  isSelected: boolean;
  shapeProps: Shape;
  onSelect: () => void;
};

export const Reactangle: FC<RectangleProps> = ({
  isSelected,
  shapeProps,
  onSelect,
  onChange,
}) => {
  const trRef = useRef<TransformerType>(null);
  const shapeRef = useRef<Konva.Rect>(null);
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
    }
  }, [isSelected]);
  return (
    <>
      <Rect
        draggable={isSelected}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        id={shapeProps.id}
        name="shape"
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node?.scaleX();
          const scaleY = node?.scaleY();
          node?.scaleX(1);
          node?.scaleY(1);
          onChange({
            ...shapeProps,
            x: node?.x(),
            y: node?.y(),
            rotation: node?.rotation(),
            width: Math.max(5, node?.width() * scaleX),
            height: Math.max(node?.height() * scaleY),
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
      {isSelected && <Transformer ref={trRef} flipEnabled={false} />}
    </>
  );
};
