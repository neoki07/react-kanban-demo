import { useSortable } from "@dnd-kit/sortable";
import { Popover } from "@mantine/core";
import { useCallback, useState } from "react";

import { EditForm } from "src/components/EditForm";
import { Item } from "src/components/Item";

export const ItemWithEditForm = ({
  id,
  value,
  setContainers,
  findContainer,
}) => {
  const [opened, setOpened] = useState(false);

  const { setNodeRef, listeners, isDragging, transform, transition } =
    useSortable({
      id,
    });

  const handleClosePopover = useCallback(() => setOpened(false), []);
  const handleCloseItem = useCallback(() => setOpened((o) => !o), []);
  const handleSubmit = useCallback(
    (data) => {
      setOpened(false);
      setContainers((containers) => {
        const containerId = findContainer(id);
        return {
          ...containers,
          [containerId]: {
            ...containers[containerId],
            items: containers[containerId].items.map((item) => {
              return item.id === id ? { id, value: data.value } : item;
            }),
          },
        };
      });
    },
    [id, setContainers, findContainer]
  );

  return (
    <Popover
      className="w-full"
      opened={opened}
      onClose={handleClosePopover}
      position="bottom"
      transition="scale-y"
      target={
        <Item
          id={id}
          value={value}
          dragging={isDragging}
          setNodeRef={setNodeRef}
          transition={transition}
          transform={transform}
          listeners={listeners}
          setContainers={setContainers}
          findContainer={findContainer}
          onClick={handleCloseItem}
        />
      }
    >
      <EditForm initialValues={{ value }} onSubmit={handleSubmit} />
    </Popover>
  );
};
