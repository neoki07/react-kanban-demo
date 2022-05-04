import {
  DndContext,
  MeasuringStrategy,
  defaultDropAnimation,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  useSensors,
  useSensor,
  MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Grid } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { AddItemButton } from "src/components/AddItemButton";
import { Container } from "src/components/Container";
import { Item } from "src/components/Item";
import { ItemWithEditForm } from "src/components/ItemWithEditForm";

const dropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

const App = () => {
  const [containers, setContainers] = useState({
    todo: {
      label: "未着手",
      color: "blue",
      items: [
        { id: 1, value: "Todo 1" },
        { id: 2, value: "Todo 2" },
        { id: 3, value: "Todo 3" },
      ],
    },
    doing: {
      label: "対応中",
      color: "teal",
      items: [
        { id: 4, value: "Doing 1" },
        { id: 5, value: "Doing 2" },
        { id: 6, value: "Doing 3" },
      ],
    },
    done: {
      label: "完了",
      color: "red",
      items: [
        { id: 7, value: "Done 1" },
        { id: 8, value: "Done 2" },
        { id: 9, value: "Done 3" },
      ],
    },
  });
  const [nextItemId, setNextItemId] = useState(
    Object.values(containers).reduce(
      (prev, container) => prev + container.items.length,
      1
    )
  );
  const [activeId, setActiveId] = useState(null);
  const lastOverId = useRef(null);
  const recentlyMovedToNewContainer = useRef(false);

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeId && activeId in containers) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in containers
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        if (overId in containers) {
          const containerItems = containers[overId].items;

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.length > 0) {
            // Return the closest droppable within that container
            const closestItem = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.includes(container.id)
              ),
            })[0];
            overId = closestItem ? closestItem.id : null;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, containers]
  );
  const [clonedItems, setClonedItems] = useState(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
  const findContainer = useCallback(
    (id) => {
      if (id in containers) {
        return id;
      }

      return Object.keys(containers).find((key) =>
        containers[key].items.some((item) => item.id === id)
      );
    },
    [containers]
  );

  const findItem = useCallback(
    (id) => {
      const container = findContainer(id);

      if (!container) {
        return null;
      }

      return containers[container].items.find((item) => item.id === id);
    },
    [containers, findContainer]
  );

  const renderSortableItemDragOverlay = (value) => {
    return <Item value={value} dragOverlay />;
  };

  const handleDragStart = useCallback(
    ({ active }) => {
      setActiveId(active.id);
      setClonedItems(containers);
    },
    [setClonedItems, containers]
  );

  const handleDragOver = useCallback(
    ({ active, over }) => {
      const overId = over ? over.id : null;

      if (!overId || active.id in containers) {
        return;
      }
      const overContainer = findContainer(overId);
      const activeContainer = findContainer(active.id);

      if (!overContainer || !activeContainer) {
        return;
      }

      if (activeContainer !== overContainer) {
        setContainers((containers) => {
          const activeItems = containers[activeContainer].items;
          const overItems = containers[overContainer].items;
          const overIndex = overItems.findIndex((item) => item.id === overId);
          const activeIndex = activeItems.findIndex(
            (item) => item.id === active.id
          );

          let newIndex;

          if (overId in containers) {
            newIndex = overItems.length + 1;
          } else {
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top >
                over.rect.top + over.rect.height;

            const modifier = isBelowOverItem ? 1 : 0;

            newIndex =
              overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
          }

          recentlyMovedToNewContainer.current = true;

          return {
            ...containers,
            [activeContainer]: {
              ...containers[activeContainer],
              items: containers[activeContainer].items.filter(
                (item) => item.id !== active.id
              ),
            },
            [overContainer]: {
              ...containers[overContainer],
              items: [
                ...containers[overContainer].items.slice(0, newIndex),
                containers[activeContainer].items[activeIndex],
                ...containers[overContainer].items.slice(
                  newIndex,
                  containers[overContainer].items.length
                ),
              ],
            },
          };
        });
      }
    },
    [findContainer, containers]
  );

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      const activeContainer = findContainer(active.id);

      if (!activeContainer) {
        setActiveId(null);
        return;
      }

      const overId = over ? over.id : null;

      if (!overId) {
        setActiveId(null);
        return;
      }

      const overContainer = findContainer(overId);

      if (overContainer) {
        const activeIndex = containers[activeContainer].items.findIndex(
          (item) => item.id === active.id
        );
        const overIndex = containers[overContainer].items.findIndex(
          (item) => item.id === overId
        );

        if (activeIndex !== overIndex) {
          setContainers((items) => ({
            ...items,
            [overContainer]: {
              ...items[overContainer],
              items: arrayMove(
                items[overContainer].items,
                activeIndex,
                overIndex
              ),
            },
          }));
        }
      }

      setActiveId(null);
    },
    [findContainer, containers]
  );

  const handleDragCancel = useCallback(() => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setContainers(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  }, [clonedItems]);

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [containers]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="m-12">
        <Grid>
          {Object.keys(containers).map((containerId) => (
            <Grid.Col key={containerId} span={4}>
              <Container
                key={containerId}
                label={containers[containerId].label}
                color={containers[containerId].color}
              >
                <SortableContext items={containers[containerId].items}>
                  {containers[containerId].items.map((item) => {
                    return (
                      <ItemWithEditForm
                        key={item.id}
                        id={item.id}
                        value={item.value}
                        setContainers={setContainers}
                        findContainer={findContainer}
                      />
                    );
                  })}
                </SortableContext>
                <AddItemButton
                  containerId={containerId}
                  setContainers={setContainers}
                  nextItemId={nextItemId}
                  setNextItemId={setNextItemId}
                />
              </Container>
            </Grid.Col>
          ))}
        </Grid>
      </div>
      {createPortal(
        <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
          {activeId
            ? renderSortableItemDragOverlay(findItem(activeId).value)
            : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};

export default App;
