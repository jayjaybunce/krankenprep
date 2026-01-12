import {
  useRef,
  type FC,
  type RefObject,
  useState,
  useEffect,
} from "react";
import { Stage as StageType } from "konva/lib/Stage";
import { Layer, Stage, Rect, Group, Transformer } from "react-konva";
import type { KonvaEventObject, NodeConfig, Node } from "konva/lib/Node";
import { Reactangle } from "./Rectangle";
import { Circle } from "./Circle";
import { Triangle } from "./Triangle";
import { RightTriangle } from "./RightTriangle";
import { Image } from "./Image";
import { Line } from "./Line";
import { Text } from "./Text";
import Konva from "konva";
import type { Shape } from "./Planner";

type PlanTabProps = {
  setSelectedId: (id: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
  selectedIds: string[];
  selectedId: string | null;
  shapes: Shape[];
  handleContextMenu: (
    e: KonvaEventObject<PointerEvent, Node<NodeConfig>>,
  ) => void;
  handleChange: (changes: Shape) => void;
  onGroupTransform: (selectedIds: string[], groupNode: Konva.Group) => void;
  backgroundSrc: string;
  isActive: boolean;
  ref: RefObject<StageType | null>;
  groupKey: number;
  drawingMode: boolean;
  onAddLine: (line: Shape) => void;
  drawingColor: string;
  drawingThickness: number;
  height?: number;
  width?: number;
};

export const PlanTab: FC<PlanTabProps> = ({
  setSelectedId,
  setSelectedIds,
  shapes,
  handleContextMenu,
  handleChange,
  onGroupTransform,
  selectedId,
  selectedIds,
  isActive,
  backgroundSrc,
  ref,
  drawingMode,
  onAddLine,
  drawingColor,
  drawingThickness,
  height,
  width,
}) => {
  const [selectionRect, setSelectionRect] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });
  const justCompletedDragSelection = useRef(false);
  const isDrawing = useRef(false);
  const [currentLine, setCurrentLine] = useState<Shape | null>(null);

  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const canvasHeight = height ? height : 800;
  const canvasWidth = width ? width : 1400;

  // Attach transformer to group when selection changes
  useEffect(() => {
    if (selectedIds.length && groupRef.current && trRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [selectedIds, shapes]);

  const getIsSelected = (id: string) => {
    if (!selectedId && selectedIds.length === 0) {
      return false;
    }
    if (id === selectedId || selectedIds.find((s) => s === id)) {
      return true;
    }
    return false;
  };

  const isShapeLocked = (id: string) => {
    const shape = shapes.find((s) => s.id === id);
    return shape?.locked || false;
  };

  const renderShape = (
    shape: Shape,
    isSelected: boolean,
    inGroup: boolean = false,
  ) => {
    // Add stroke to selected shapes in group, preserving all original properties
    let modifiedShapeProps = shape;

    if (inGroup) {
      if (shape.type === "img") {
        // For images, only add stroke - don't modify fill
        modifiedShapeProps = {
          ...shape,
        };
      } else {
        // For other shapes, add stroke and ensure fill is preserved
        modifiedShapeProps = {
          ...shape,
        };
      }
    }

    const commonProps = {
      key: shape.id,
      // Don't allow individual selection when shape is in group or locked
      onSelect: inGroup || shape.locked ? () => {} : () => setSelectedId(shape.id),
      onChange: handleChange,
      isSelected,
      shapeProps: modifiedShapeProps,
    };

    switch (shape.type) {
      case "rect":
        return <Reactangle {...commonProps} />;
      case "circle":
        return <Circle {...commonProps} />;
      case "triangle":
        return <Triangle {...commonProps} />;
      case "right triangle":
        return <RightTriangle {...commonProps} />;
      case "img":
        return shape.src ? <Image {...commonProps} src={shape.src} /> : null;
      case "line":
        return <Line {...commonProps} />;
      case "text":
        return <Text {...commonProps} />;
      default:
        return null;
    }
  };

  const pointerPos = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    return stage?.getPointerPosition();
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Drawing mode
    if (drawingMode) {
      isDrawing.current = true;
      const pos = pointerPos(e);
      if (!pos) return;

      const newLine: Shape = {
        type: "line",
        points: [0, 0],
        x: pos.x,
        y: pos.y,
        stroke: drawingColor,
        strokeWidth: drawingThickness,
        id: Date.now().toString(),
        scaleX: 1,
        scaleY: 1,
        height: 0,
        width: 0,
        rotation: 0,
        fill: "",
        opacity: 1,
      };
      setCurrentLine(newLine);
      return;
    }

    // Ignore clicks on transformer or group
    if (
      e.target.getParent() === trRef.current ||
      e.target.parent === groupRef.current
    ) {
      return;
    }

    const clickedOnEmpty =
      e.target === ref.current || e.target.attrs.id === "background";

    if (clickedOnEmpty) {
      // Don't   selection yet - just start the selection rectangle
      // Selection will be cleared in onClick if it was a click (not a drag)
      const pos = pointerPos(e);
      if (!pos) return;

      setSelectionRect({
        visible: true,
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
      });
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Drawing mode
    if (drawingMode && isDrawing.current && currentLine) {
      const pos = pointerPos(e);
      if (!pos) return;

      const newPoints = [
        ...(currentLine.points || []),
        pos.x - currentLine.x,
        pos.y - currentLine.y,
      ];

      setCurrentLine({
        ...currentLine,
        points: newPoints,
      });
      return;
    }

    if (!selectionRect.visible) return;

    const pos = pointerPos(e);
    if (!pos) return;

    setSelectionRect((prev) => ({
      ...prev,
      x2: pos.x,
      y2: pos.y,
    }));
  };

  const handleMouseUp = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Drawing mode
    if (drawingMode && isDrawing.current && currentLine) {
      isDrawing.current = false;
      onAddLine(currentLine);
      setCurrentLine(null);
      return;
    }

    if (!selectionRect.visible) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const shapeNodes = stage.find(".shape");

    const box = {
      x: Math.min(selectionRect.x1, selectionRect.x2),
      y: Math.min(selectionRect.y1, selectionRect.y2),
      width: Math.abs(selectionRect.x2 - selectionRect.x1),
      height: Math.abs(selectionRect.y2 - selectionRect.y1),
    };

    const selected: string[] = [];
    shapeNodes.forEach((shapeNode) => {
      const shapeBox = shapeNode.getClientRect();
      const intersected = Konva.Util.haveIntersection(box, shapeBox);
      setSelectedId(null);
      if (intersected) {
        const shapeId = shapeNode.id();
        if (shapeId && shapeId !== "background" && !isShapeLocked(shapeId)) {
          selected.push(shapeId);
        }
      }
    });

    // Hide selection rectangle BEFORE updating state
    setSelectionRect({
      visible: false,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
    });

    if (selected.length > 0) {
      setSelectedIds(selected);
      justCompletedDragSelection.current = true;
    }
  };

  return (
    <Stage
      ref={ref}
      width={canvasWidth}
      height={canvasHeight}
      className={`${isActive ? "block" : "hidden"}`}
      onClick={(e) => {
        // Don't process click if we just completed a drag selection
        if (justCompletedDragSelection.current) {
          justCompletedDragSelection.current = false;
          return;
        }

        // Only clear selection on click if we're not dragging
        if (!selectionRect.visible) {
          const clickedOnEmpty =
            e.target === ref.current || e.target.attrs.id === "background";
          if (clickedOnEmpty) {
            setSelectedId(null);
            setSelectedIds([]);
          }
        }
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      <Layer>
        {backgroundSrc && (
          <Image
            src={backgroundSrc}
            shapeProps={{
              id: "background",
              x: 0,
              y: 0,
              width: canvasWidth,
              height: canvasHeight,
              type: "img",
              src: backgroundSrc,
              scaleX: 1,
              scaleY: 1,
              stroke: "",
              strokeWidth: 0,
              rotation: 0,
              fill: "",
              opacity: 1,
            }}
            onSelect={() => {}}
            onChange={() => {}}
            isSelected={false}
          />
        )}
        {/* Render unselected shapes */}
        {shapes
          .filter((shape) => !getIsSelected(shape.id))
          .map((shape) => renderShape(shape, false))}
        {/* Render single selected shape with its own transformer */}
        {selectedId &&
          shapes
            .filter((shape) => shape.id === selectedId)
            .map((shape) => renderShape(shape, true))}
        {/* Render current line being drawn */}
        {currentLine && (
          <Line
            shapeProps={currentLine}
            isSelected={false}
            onSelect={() => {}}
            onChange={() => {}}
          />
        )}
      </Layer>
      <Layer>
        {/* Group for multi-selected shapes only */}
        {selectedIds.length > 0 && (
          <>
            <Group
              ref={groupRef}
              // groupKey={groupKey}
              draggable
              onDragEnd={() => {
                if (groupRef.current) {
                  onGroupTransform(selectedIds, groupRef.current);
                  if (trRef.current) {
                    trRef.current.clearCache();
                  }
                }
              }}
              onTransformEnd={() => {
                if (groupRef.current) {
                  onGroupTransform(selectedIds, groupRef.current);
                  trRef.current?.forceUpdate();
                  trRef.current?.getLayer()?.batchDraw();
                }
              }}
            >
              {shapes
                .filter((shape) => selectedIds.includes(shape.id))
                .map((shape) => renderShape(shape, false, true))}
            </Group>
            <Transformer ref={trRef} />
          </>
        )}
        <Rect
          x={Math.min(selectionRect.x1, selectionRect.x2)}
          y={Math.min(selectionRect.y1, selectionRect.y2)}
          width={Math.abs(selectionRect.x2 - selectionRect.x1)}
          height={Math.abs(selectionRect.y2 - selectionRect.y1)}
          fill="rgba(0, 123, 255, 0.3)"
          stroke="rgba(0, 123, 255, 0.8)"
          strokeWidth={2}
          visible={selectionRect.visible}
        />
      </Layer>
    </Stage>
  );
};
