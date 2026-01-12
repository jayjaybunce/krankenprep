import { useEffect, useRef, type FC } from "react";
import { Line as KonvaLine, Transformer } from "react-konva";
import type { Shape } from "./Planner";
import { Transformer as TransformerType } from "konva/lib/shapes/Transformer";
import Konva from "konva";

type LineProps = {
  onChange: (changes: Shape) => void;
  isSelected: boolean;
  shapeProps: Shape;
  onSelect: () => void;
};

export const Line: FC<LineProps> = ({
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

  return (
    <>
      <KonvaLine
        draggable={isSelected && !shapeProps.locked}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        points={shapeProps.points || []}
        stroke={shapeProps.stroke}
        strokeWidth={shapeProps.strokeWidth}
        lineCap="round"
        lineJoin="round"
        tension={0.5}
        globalCompositeOperation="source-over"
        id={shapeProps.id}
        name="shape"
        x={shapeProps.x}
        y={shapeProps.y}
        scaleX={shapeProps.scaleX}
        scaleY={shapeProps.scaleY}
        rotation={shapeProps.rotation}
        opacity={shapeProps.opacity}
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
            scaleX: scaleX,
            scaleY: scaleY,
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
