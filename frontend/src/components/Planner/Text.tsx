import { useEffect, useRef, type FC, useState } from "react";
import { Text as KonvaText, Transformer } from "react-konva";
import type { Shape } from "./Planner";
import { Transformer as TransformerType } from "konva/lib/shapes/Transformer";
import Konva from "konva";
import { Html } from "react-konva-utils";

type TextProps = {
  onChange: (changes: Shape) => void;
  isSelected: boolean;
  shapeProps: Shape;
  onSelect: () => void;
};

export const Text: FC<TextProps> = ({
  isSelected,
  shapeProps,
  onSelect,
  onChange,
}) => {
  const trRef = useRef<TransformerType>(null);
  const textRef = useRef<Konva.Text>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(shapeProps.text || "Text");

  // Update transformer when text properties change
  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      const textNode = textRef.current;

      // Let Konva recalculate text dimensions
      textNode.getLayer()?.batchDraw();

      // Small delay to ensure text has been measured
      requestAnimationFrame(() => {
        if (trRef.current && textNode) {
          trRef.current.nodes([textNode]);
          trRef.current.forceUpdate();
          trRef.current.getLayer()?.batchDraw();
        }
      });
    }
  }, [isSelected, shapeProps.fontSize, shapeProps.fontFamily, shapeProps.text]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(shapeProps.text || "Text");
  };

  // Calculate textarea dimensions
  const getTextareaDimensions = () => {
    const fontSize = shapeProps.fontSize || 24;
    const fontFamily = shapeProps.fontFamily || "Arial";

    // Calculate dimensions using canvas measurement
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      context.font = `${fontSize}px ${fontFamily}`;
      const lines = (editValue || "Text").split('\n');

      // Calculate width based on the longest line
      const maxWidth = Math.max(
        ...lines.map(line => context.measureText(line || " ").width)
      );

      // Calculate height based on number of lines and line height
      // Line height is typically 1.2x font size
      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;

      // Add padding (4px * 2 = 8px) plus border (2px * 2 = 4px)
      return {
        width: Math.max(50, maxWidth + 12),
        height: Math.max(30, totalHeight + 12),
      };
    }

    return { width: 100, height: 30 };
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange({
      ...shapeProps,
      text: editValue,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(shapeProps.text || "Text");
    }
  };

  return (
    <>
      {!isEditing ? (
        <KonvaText
          draggable={isSelected && !shapeProps.locked}
          onClick={onSelect}
          onTap={onSelect}
          onDblClick={handleDoubleClick}
          onDblTap={handleDoubleClick}
          ref={textRef}
          x={shapeProps.x}
          y={shapeProps.y}
          rotation={shapeProps.rotation}
          opacity={shapeProps.opacity}
          text={shapeProps.text || "Text"}
          fontSize={shapeProps.fontSize || 24}
          fontFamily={shapeProps.fontFamily || "Arial"}
          fill={shapeProps.fill || "white"}
          id={shapeProps.id}
          name="shape"
          listening={true}
          perfectDrawEnabled={false}
          onTransformEnd={() => {
            const node = textRef.current;
            if (!node) return;

            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // Update font size based on scale
            const newFontSize = (shapeProps.fontSize || 24) * Math.max(scaleX, scaleY);

            // Reset scale to 1
            node.scaleX(1);
            node.scaleY(1);

            onChange({
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              fontSize: newFontSize,
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
      ) : (
        <Html
          divProps={{
            style: {
              position: "absolute",
              top: `${shapeProps.y}px`,
              left: `${shapeProps.x}px`,
            },
          }}
        >
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              width: `${getTextareaDimensions().width}px`,
              height: `${getTextareaDimensions().height}px`,
              fontSize: `${shapeProps.fontSize || 24}px`,
              fontFamily: shapeProps.fontFamily || "Arial",
              lineHeight: "1.2",
              color: shapeProps.fill || "white",
              background: "rgba(0, 0, 0, 0.5)",
              border: "2px solid cyan",
              padding: "4px",
              outline: "none",
              resize: "none",
              overflow: "hidden",
              whiteSpace: "pre",
              boxSizing: "border-box",
            }}
          />
        </Html>
      )}
      {isSelected && !isEditing && (
        <Transformer ref={trRef} flipEnabled={false} />
      )}
    </>
  );
};
