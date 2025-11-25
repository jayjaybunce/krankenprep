import {
  type FC,
  type PropsWithChildren,
  type SetStateAction,
  type Dispatch,
  useCallback,
  type ReactElement,
} from "react";
import update from "immutability-helper";
import { PhaseCard } from "../PhaseCard";

type SortableContainerProps = {
  items: any[];
  setItems: Dispatch<SetStateAction<any>>;
};

export const OrderableContainer: FC<
  PropsWithChildren<SortableContainerProps>
> = ({ items, setItems }) => {
  const moveItem = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setItems((prevItems: any) => {
        return update(prevItems, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevItems[dragIndex]],
          ],
        });
      });
    },
    [setItems],
  );

  const renderItem = useCallback(
    (item: any, index: number) => {
      return (
        <PhaseCard
          key={item.id}
          index={index}
          id={item.id}
          moveCard={moveItem}
          phaseNotes={item.posts}
          subtitle={`${item.posts.length} note${item.posts.length > 1 ? "s" : ""}`}
          title={item?.name}
          phaseNumber={item?.phaseNumber}
          hasNewNotes={item?.hasNewNotes ?? true}
        />
      );
    },
    [moveItem],
  );

  return <>{items.map((card, i) => renderItem(card, i))}</>;
};
