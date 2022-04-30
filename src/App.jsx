/* eslint-disable unused-imports/no-unused-imports */
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
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import {
  Card,
  Grid,
  Divider,
  Badge,
  TextInput,
  Text,
  Popover,
  Group,
  Button,
  Paper,
  ActionIcon,
} from "@mantine/core";
import { useForm, useHover } from "@mantine/hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, X } from "tabler-icons-react";

import { Container } from "src/components/Container";
import { Item } from "src/components/Item";

function DroppableContainer({ children, columns = 1, ...props }) {
  return (
    <Container columns={columns} {...props}>
      {children}
    </Container>
  );
}

const dropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

export function MultipleContainers() {
  const [containers, setContainers] = useState({
    todo: {
      label: "未着手",
      color: "blue",
      items: ["Todo 1", "Todo 2", "Todo 3"],
    },
    doing: {
      label: "対応中",
      color: "teal",
      items: ["Doing 1", "Doing 2", "Doing 3"],
    },
    done: {
      label: "完了",
      color: "red",
      items: ["Done 1", "Done 2", "Done 3"],
    },
  });
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
        containers[key].items.includes(id)
      );
    },
    [containers]
  );

  const getIndex = (id) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = containers[container].items.indexOf(id);

    return index;
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
        const activeIndex = containers[activeContainer].items.indexOf(
          active.id
        );
        const overIndex = containers[overContainer].items.indexOf(overId);

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
              <DroppableContainer
                key={containerId}
                id={containerId}
                label={containers[containerId].label}
                color={containers[containerId].color}
                items={containers[containerId].items}
              >
                <SortableContext items={containers[containerId].items}>
                  {containers[containerId].items.map((value) => {
                    return (
                      <SortableItem
                        key={value}
                        id={value}
                        containerId={containerId}
                        getIndex={getIndex}
                        setContainers={setContainers}
                      />
                    );
                  })}
                </SortableContext>
                <AddButton
                  containerId={containerId}
                  setContainers={setContainers}
                />
              </DroppableContainer>
            </Grid.Col>
          ))}
        </Grid>
      </div>
      {createPortal(
        <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
          {activeId ? renderSortableItemDragOverlay(activeId) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );

  function renderSortableItemDragOverlay(id) {
    return <Item value={id} dragOverlay />;
  }
}

function EditForm({ initialValues, onSubmit, onCancel }) {
  const form = useForm({
    initialValues,
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Group position="apart">
        <TextInput
          required
          value={form.values.text}
          onChange={(event) =>
            form.setFieldValue("value", event.currentTarget.value)
          }
          error={form.errors.text}
          variant="default"
        />
        <Button
          className="bg-cyan-500 hover:bg-cyan-600"
          type="submit"
          size="sm"
        >
          Save
        </Button>
      </Group>
    </form>
  );
}

function SortableItem({ disabled, id, setContainers }) {
  const [opened, setOpened] = useState(false);

  const { setNodeRef, listeners, isDragging, transform, transition } =
    useSortable({
      id,
    });
  return (
    <Popover
      className="w-full"
      opened={opened}
      onClose={() => setOpened(false)}
      position="bottom"
      transition="scale-y"
      target={
        <Item
          ref={disabled ? undefined : setNodeRef}
          value={id}
          dragging={isDragging}
          transition={transition}
          transform={transform}
          listeners={listeners}
          setContainers={setContainers}
          onClick={() => setOpened(!opened)}
        />
      }
    >
      <EditForm
        initialValues={{ value: id }}
        onSubmit={(data) => {
          setOpened(false);
          setContainers((containers) => {
            const targetContainer = Object.keys(containers).find((key) =>
              containers[key].items.includes(id)
            );

            return {
              ...containers,
              [targetContainer]: {
                ...containers[targetContainer],
                items: containers[targetContainer].items.map((itemId) => {
                  return itemId === id ? data.value : itemId;
                }),
              },
            };
          });
        }}
      />
    </Popover>
  );
}

const AddButton = ({ disabled, containerId, setContainers }) => {
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      className="w-full"
      opened={opened}
      onClose={() => setOpened(false)}
      position="bottom"
      transition="scale-y"
      target={
        <div className="m-2 flex justify-center">
          <ActionIcon
            className="hover:bg-gray-100"
            radius={10}
            size={40}
            onClick={() => setOpened((o) => !o)}
          >
            <Plus size={20} />
          </ActionIcon>
        </div>
      }
    >
      <EditForm
        initialValues={{ value: "" }}
        onSubmit={(data) => {
          setOpened(false);
          setContainers((containers) => {
            return {
              ...containers,
              [containerId]: {
                ...containers[containerId],
                items: [...containers[containerId].items, data.value],
              },
            };
          });
        }}
      />
    </Popover>
  );
};

// const initialColumns = [
//   {
//     id: 1,
//     name: "未着手",
//     color: "blue",
//     items: [
//       { id: 1, text: "Todo 1" },
//       { id: 2, text: "Todo 2" },
//       { id: 3, text: "Todo 3" },
//     ],
//   },
//   {
//     id: 2,
//     name: "対応中",
//     color: "teal",
//     items: [
//       { id: 4, text: "Doing 1" },
//       { id: 5, text: "Doing 2" },
//       { id: 6, text: "Doing 3" },
//     ],
//   },
//   {
//     id: 3,
//     name: "完了",
//     color: "red",
//     items: [
//       { id: 7, text: "Done 1" },
//       { id: 8, text: "Done 2" },
//       { id: 9, text: "Done 3" },
//     ],
//   },
// ];

// function EditForm({ initialValues, onSubmit, onCancel }) {
//   const form = useForm({
//     initialValues,
//   });

//   return (
//     <form onSubmit={form.onSubmit(onSubmit)}>
//       <Group position="apart">
//         <TextInput
//           required
//           value={form.values.text}
//           onChange={(event) =>
//             form.setFieldValue("text", event.currentTarget.value)
//           }
//           error={form.errors.text}
//           variant="default"
//         />
//         <Button
//           className="bg-cyan-500 hover:bg-cyan-600"
//           type="submit"
//           size="sm"
//         >
//           Save
//         </Button>
//       </Group>
//     </form>
//   );
// }

// const KanbanItem = (props) => {
//   const { item, columnId, setColumns } = props;
//   const [opened, setOpened] = useState(false);
//   const { hovered, ref } = useHover();
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: item.id });
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <Popover
//       className="w-full"
//       opened={opened}
//       onClose={() => setOpened(false)}
//       position="bottom"
//       transition="scale-y"
//       target={
//         <div
//           className="z-40"
//           ref={setNodeRef}
//           style={style}
//           {...attributes}
//           {...listeners}
//         >
//           <Paper
//             className="relative m-1 break-words border border-gray-200 px-4 py-3 hover:cursor-pointer hover:bg-gray-50"
//             radius="sm"
//             onClick={() => setOpened((o) => !o)}
//             ref={ref}
//           >
//             <Text>{item.text}</Text>
//             {hovered && (
//               <div className="absolute top-0 left-0 flex h-full w-full justify-end p-0">
//                 <ActionIcon
//                   className="h-full bg-gray-100 hover:bg-gray-200"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setColumns((prevColumns) =>
//                       prevColumns.map((column) =>
//                         column.id === columnId
//                           ? {
//                               ...column,
//                               items: column.items.filter(
//                                 (i) => i.id !== item.id
//                               ),
//                             }
//                           : column
//                       )
//                     );
//                   }}
//                 >
//                   <X size={14} />
//                 </ActionIcon>
//               </div>
//             )}
//           </Paper>
//         </div>
//       }
//     >
//       <EditForm
//         initialValues={{ text: item.text }}
//         onSubmit={(data) => {
//           setOpened(false);
//           setColumns((prevColumns) =>
//             prevColumns.map((column) =>
//               column.id === columnId
//                 ? {
//                     ...column,
//                     items: column.items.map((i) =>
//                       i.id === item.id ? { ...i, text: data.text } : i
//                     ),
//                   }
//                 : column
//             )
//           );
//         }}
//       />
//     </Popover>
//   );
// };

// const AddButton = (props) => {
//   const { columnId, setColumns, nextItemId, setNextItemId } = props;
//   const [opened, setOpened] = useState(false);

//   return (
//     <Popover
//       className="w-full"
//       opened={opened}
//       onClose={() => setOpened(false)}
//       position="bottom"
//       transition="scale-y"
//       target={
//         <div className="m-2 flex justify-center">
//           <ActionIcon
//             className="hover:bg-gray-100"
//             radius={10}
//             size={40}
//             onClick={() => setOpened((o) => !o)}
//           >
//             <Plus size={20} />
//           </ActionIcon>
//         </div>
//       }
//     >
//       <EditForm
//         initialValues={{ text: "" }}
//         onSubmit={(data) => {
//           setNextItemId((id) => id + 1);
//           setOpened(false);
//           setColumns((prevColumns) =>
//             prevColumns.map((column) =>
//               column.id === columnId
//                 ? {
//                     ...column,
//                     items: [
//                       ...column.items,
//                       { id: nextItemId, text: data.text },
//                     ],
//                   }
//                 : column
//             )
//           );
//         }}
//       />
//     </Popover>
//   );
// };

// const App = () => {
//   const [columns, setColumns] = useState(initialColumns);
//   const [nextItemId, setNextItemId] = useState(initialColumns.length + 1);

//   const handleDragEnd = useCallback(
//     (event) => {
//       const { active, over } = event;
//       if (over === null) {
//         return;
//       }
//       if (active.id === over.id) {
//         console.log(active.id, over.id);
//         return;
//       }
//     },
//     [columns]
//   );

//   useEffect(() => {
//     requestAnimationFrame(() => {
//       console.log("req");
//     });
//   }, [columns]);

//   const handleDragOver = useCallback(
//     (event) => {
//       const { active, over } = event;

//       if (!over) {
//         return;
//       }

//       const overColumnIndex = columns.findIndex(
//         (column) => column.items.findIndex((item) => item.id === over.id) !== -1
//       );
//       const activeColumnIndex = columns.findIndex(
//         (column) =>
//           column.items.findIndex((item) => item.id === active.id) !== -1
//       );

//       if (
//         overColumnIndex !== -1 &&
//         activeColumnIndex !== -1 &&
//         overColumnIndex !== activeColumnIndex
//       ) {
//         setColumns((columns) => {
//           const newColumns = [...columns];
//           const overColumn = newColumns[overColumnIndex];
//           const activeColumn = newColumns[activeColumnIndex];

//           const overItemIndex = overColumn.items.findIndex(
//             (item) => item.id === over.id
//           );
//           const activeItemIndex = activeColumn.items.findIndex(
//             (item) => item.id === active.id
//           );

//           console.log(
//             overItemIndex,
//             activeItemIndex,
//             activeColumn,
//             activeColumn.items[activeItemIndex]
//           );
//           overColumn.items.splice(overItemIndex, 0, {
//             id: active.id,
//             text: activeColumn.items[activeItemIndex].text,
//           });
//           activeColumn.items.splice(activeItemIndex, 1);

//           return newColumns;
//         });
//       }
//     },
//     [columns]
//   );

//   useEffect(() => {
//     console.log(columns);
//   }, [columns]);

//   return (
//     <DndContext
//       onDragEnd={handleDragEnd}
//       onDragOver={handleDragOver}
//       measuring={{
//         droppable: {
//           strategy: MeasuringStrategy.Always,
//         },
//       }}
//     >
//       <div className="m-12">
//         <Grid>
//           {columns.map((column) => (
//             <Grid.Col key={column.id} span={4}>
//               <Paper>
//                 <Badge
//                   className="flex justify-center"
//                   size="lg"
//                   color={column.color}
//                 >
//                   {column.name}
//                 </Badge>
//                 <Divider my="sm" variant="dotted" />
//                 <SortableContext items={column.items}>
//                   {column.items.map((item) => (
//                     <KanbanItem
//                       key={item.id}
//                       item={item}
//                       columnId={column.id}
//                       setColumns={setColumns}
//                     />
//                   ))}
//                 </SortableContext>
//                 <AddButton
//                   columnId={column.id}
//                   setColumns={setColumns}
//                   nextItemId={nextItemId}
//                   setNextItemId={setNextItemId}
//                 />
//               </Paper>
//             </Grid.Col>
//           ))}
//         </Grid>
//       </div>
//     </DndContext>
//   );
// };

const App = MultipleContainers;
export default App;
