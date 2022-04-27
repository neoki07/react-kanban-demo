/* eslint-disable unused-imports/no-unused-imports */
import {
  DndContext,
  MeasuringStrategy,
  defaultDropAnimation,
  DragOverlay,
  useDroppable,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  defaultAnimateLayoutChanges,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { createPortal, unstable_batchedUpdates } from "react-dom";
import { Plus, X } from "tabler-icons-react";

import { Container } from "src/components/Container";
import { Item } from "src/components/Item";

// const animateLayoutChanges = (args) =>
//   args.isSorting || args.wasDragging ? defaultAnimateLayoutChanges(args) : true;

function DroppableContainer({
  children,
  columns = 1,
  // disabled,
  // id,
  // items,
  // style,
  ...props
}) {
  // const {
  //   active,
  //   attributes,
  //   isDragging,
  //   listeners,
  //   over,
  //   setNodeRef,
  //   transition,
  //   transform,
  // } = useSortable({
  //   id,
  //   data: {
  //     type: "container",
  //     children: items,
  //   },
  //   animateLayoutChanges,
  // });
  // const isOverContainer = over
  //   ? (id === over.id &&
  //       active &&
  //       active.data.current &&
  //       active.data.current.type !== "container") ||
  //     items.includes(over.id)
  //   : false;

  return (
    <Container
      // ref={disabled ? undefined : setNodeRef}
      // style={{
      //   ...style,
      //   transition,
      //   transform: CSS.Translate.toString(transform),
      //   opacity: isDragging ? 0.5 : undefined,
      // }}
      // hover={isOverContainer}
      // handleProps={{
      //   ...attributes,
      //   ...listeners,
      // }}
      columns={columns}
      {...props}
    >
      {children}
    </Container>
  );
}

const dropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

// export const TRASH_ID = "void";
// const PLACEHOLDER_ID = "placeholder";
// const empty = [];

export function MultipleContainers() {
  //{
  // adjustScale = false,
  // itemCount = 3,
  // cancelDrop,
  // columns,
  // handle = false,
  // containerStyle,
  // coordinateGetter,
  // getItemStyles = () => ({}),
  // wrapperStyle = () => ({}),
  // minimal = false,
  // modifiers,
  // renderItem,
  // strategy = verticalListSortingStrategy,
  // trashable = false,
  // vertical = false,
  // scrollable,
  // }) {
  const [items, setItems] = useState({
    A: ["A1", "A2", "A3"],
    B: ["B1", "B2", "B3"],
    C: ["C1", "C2", "C3"],
    D: ["D1", "D2", "D3"],
  });
  const [containers, setContainers] = useState(Object.keys(items));
  const [activeId, setActiveId] = useState(null);
  const lastOverId = useRef(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;

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
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items
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
        // if (overId === TRASH_ID) {
        //   // If the intersecting droppable is the trash, return early
        //   // Remove this if you're not using trashable functionality in your app
        //   return intersections;
        // }

        if (overId in items) {
          const containerItems = items[overId];

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
    [activeId, items]
  );
  const [clonedItems, setClonedItems] = useState(null);
  // const sensors = useSensors(
  //   useSensor(MouseSensor)
  //   useSensor(TouchSensor),
  //   useSensor(KeyboardSensor, {
  //     coordinateGetter,
  //   })
  // );
  const findContainer = useCallback(
    (id) => {
      if (id in items) {
        return id;
      }

      return Object.keys(items).find((key) => items[key].includes(id));
    },
    [items]
  );

  const getIndex = (id) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = items[container].indexOf(id);

    return index;
  };

  const handleDragStart = useCallback(
    ({ active }) => {
      setActiveId(active.id);
      setClonedItems(items);
    },
    [setClonedItems, items]
  );

  const handleDragOver = useCallback(
    ({ active, over }) => {
      const overId = over ? over.id : null;

      // if (!overId || overId === TRASH_ID || active.id in items) {
      //   return;
      // }
      if (!overId || active.id in items) {
        return;
      }
      const overContainer = findContainer(overId);
      const activeContainer = findContainer(active.id);

      if (!overContainer || !activeContainer) {
        return;
      }

      if (activeContainer !== overContainer) {
        setItems((items) => {
          const activeItems = items[activeContainer];
          const overItems = items[overContainer];
          const overIndex = overItems.indexOf(overId);
          const activeIndex = activeItems.indexOf(active.id);

          let newIndex;

          if (overId in items) {
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
            ...items,
            [activeContainer]: items[activeContainer].filter(
              (item) => item !== active.id
            ),
            [overContainer]: [
              ...items[overContainer].slice(0, newIndex),
              items[activeContainer][activeIndex],
              ...items[overContainer].slice(
                newIndex,
                items[overContainer].length
              ),
            ],
          };
        });
      }
    },
    [findContainer, items]
  );

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      if (active.id in items && over ? over.id : null) {
        setContainers((containers) => {
          const activeIndex = containers.indexOf(active.id);
          const overIndex = containers.indexOf(over.id);

          return arrayMove(containers, activeIndex, overIndex);
        });
      }

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

      // if (overId === TRASH_ID) {
      //   setItems((items) => ({
      //     ...items,
      //     [activeContainer]: items[activeContainer].filter(
      //       (id) => id !== activeId
      //     ),
      //   }));
      //   setActiveId(null);
      //   return;
      // }

      // if (overId === PLACEHOLDER_ID) {
      //   const newContainerId = getNextContainerId();

      //   unstable_batchedUpdates(() => {
      //     setContainers((containers) => [...containers, newContainerId]);
      //     setItems((items) => ({
      //       ...items,
      //       [activeContainer]: items[activeContainer].filter(
      //         (id) => id !== activeId
      //       ),
      //       [newContainerId]: [active.id],
      //     }));
      //     setActiveId(null);
      //   });
      //   return;
      // }

      const overContainer = findContainer(overId);

      if (overContainer) {
        const activeIndex = items[activeContainer].indexOf(active.id);
        const overIndex = items[overContainer].indexOf(overId);

        if (activeIndex !== overIndex) {
          setItems((items) => ({
            ...items,
            [overContainer]: arrayMove(
              items[overContainer],
              activeIndex,
              overIndex
            ),
          }));
        }
      }

      setActiveId(null);
    },
    [findContainer, items]
  );

  const handleDragCancel = useCallback(() => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  }, [clonedItems]);

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  return (
    <DndContext
      // sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      // cancelDrop={cancelDrop}
      onDragCancel={handleDragCancel}
      // modifiers={modifiers}
    >
      <div
        style={{
          display: "inline-grid",
          boxSizing: "border-box",
          padding: 20,
          gridAutoFlow: "column",
        }}
      >
        {containers.map((containerId) => (
          <DroppableContainer
            key={containerId}
            id={containerId}
            label={`Column ${containerId}`}
            // columns={columns}
            items={items[containerId]}
            // scrollable={scrollable}
            // style={containerStyle}
            unstyled={false}
            // onRemove={() => handleRemove(containerId)}
          >
            <SortableContext items={items[containerId]}>
              {items[containerId].map((value, index) => {
                return (
                  <SortableItem
                    disabled={isSortingContainer}
                    key={value}
                    id={value}
                    index={index}
                    handle={false}
                    // style={getItemStyles}
                    // wrapperStyle={wrapperStyle}
                    // renderItem={renderItem}
                    containerId={containerId}
                    getIndex={getIndex}
                  />
                );
              })}
            </SortableContext>
          </DroppableContainer>
        ))}
        {/* {minimal ? undefined : (
          <DroppableContainer
            id={PLACEHOLDER_ID}
            disabled={isSortingContainer}
            items={empty}
            onClick={handleAddColumn}
            placeholder
          >
            + Add column
          </DroppableContainer>
        )} */}
      </div>
      {createPortal(
        <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
          {activeId ? renderSortableItemDragOverlay(activeId) : null}
          {/* {activeId
            ? containers.includes(activeId)
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null} */}
        </DragOverlay>,
        document.body
      )}
      {/* {trashable && activeId && !containers.includes(activeId) ? (
        <Trash id={TRASH_ID} />
      ) : null} */}
    </DndContext>
  );

  function renderSortableItemDragOverlay(id) {
    return (
      <Item
        value={id}
        handle={false}
        // style={getItemStyles({
        //   containerId: findContainer(id),
        //   overIndex: -1,
        //   index: getIndex(id),
        //   value: id,
        //   isSorting: true,
        //   isDragging: true,
        //   isDragOverlay: true,
        // })}
        color={getColor(id)}
        // wrapperStyle={wrapperStyle({ index: 0 })}
        // renderItem={renderItem}
        dragOverlay
      />
    );
  }

  // function renderContainerDragOverlay(containerId) {
  //   return (
  //     <Container
  //       label={`Column ${containerId}`}
  //       columns={columns}
  //       style={{
  //         height: "100%",
  //       }}
  //       shadow
  //       unstyled={false}
  //     >
  //       {items[containerId].map((item, index) => (
  //         <Item
  //           key={item}
  //           value={item}
  //           handle={handle}
  //           style={getItemStyles({
  //             containerId,
  //             overIndex: -1,
  //             index: getIndex(item),
  //             value: item,
  //             isDragging: false,
  //             isSorting: false,
  //             isDragOverlay: false,
  //           })}
  //           color={getColor(item)}
  //           wrapperStyle={wrapperStyle({ index })}
  //           renderItem={renderItem}
  //         />
  //       ))}
  //     </Container>
  //   );
  // }

  // function handleRemove(containerID) {
  //   setContainers((containers) =>
  //     containers.filter((id) => id !== containerID)
  //   );
  // }

  // function handleAddColumn() {
  //   const newContainerId = getNextContainerId();

  //   unstable_batchedUpdates(() => {
  //     setContainers((containers) => [...containers, newContainerId]);
  //     setItems((items) => ({
  //       ...items,
  //       [newContainerId]: [],
  //     }));
  //   });
  // }

  // function getNextContainerId() {
  //   const containerIds = Object.keys(items);
  //   const lastContainerId = containerIds[containerIds.length - 1];

  //   return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
  // }
}

function getColor(id) {
  switch (id[0]) {
    case "A":
      return "#7193f1";
    case "B":
      return "#ffda6c";
    case "C":
      return "#00bcd4";
    case "D":
      return "#ef769f";
  }

  return undefined;
}

// function Trash({ id }) {
//   const { setNodeRef, isOver } = useDroppable({
//     id,
//   });

//   return (
//     <div
//       ref={setNodeRef}
//       style={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         position: "fixed",
//         left: "50%",
//         marginLeft: -150,
//         bottom: 20,
//         width: 300,
//         height: 60,
//         borderRadius: 5,
//         border: "1px solid",
//         borderColor: isOver ? "red" : "#DDD",
//       }}
//     >
//       Drop here to delete
//     </div>
//   );
// }

function SortableItem({
  disabled,
  id,
  index,
  handle,
  // renderItem,
  // style,
  // containerId,
  // getIndex,
  // wrapperStyle,
}) {
  const {
    setNodeRef,
    listeners,
    isDragging,
    isSorting,
    // over,
    // overIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      index={index}
      // wrapperStyle={wrapperStyle({ index })}
      style={{}}
      // style={style({
      //   index,
      //   value: id,
      //   isDragging,
      //   isSorting,
      //   overIndex: over ? getIndex(over.id) : overIndex,
      //   containerId,
      // })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      // renderItem={renderItem}
    />
  );
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}

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
