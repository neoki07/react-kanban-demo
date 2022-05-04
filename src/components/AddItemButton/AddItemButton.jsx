import { ActionIcon, Popover } from "@mantine/core";
import { useCallback, useState } from "react";
import { Plus } from "tabler-icons-react";

import { EditForm } from "src/components/EditForm";

export const AddItemButton = ({
  containerId,
  setContainers,
  nextItemId,
  setNextItemId,
}) => {
  const [opened, setOpened] = useState(false);

  const handleClose = useCallback(() => setOpened(false), []);
  const handleClick = useCallback(() => setOpened((o) => !o), []);
  const handleSubmit = useCallback(
    (data) => {
      setOpened(false);
      setNextItemId((id) => id + 1);
      setContainers((containers) => {
        return {
          ...containers,
          [containerId]: {
            ...containers[containerId],
            items: [
              ...containers[containerId].items,
              { id: nextItemId, value: data.value },
            ],
          },
        };
      });
    },
    [containerId, setContainers, nextItemId, setNextItemId]
  );

  return (
    <Popover
      className="w-full"
      opened={opened}
      onClose={handleClose}
      position="bottom"
      transition="scale-y"
      target={
        <div className="m-2 flex justify-center">
          <ActionIcon
            className="hover:bg-gray-100"
            radius={10}
            size={40}
            onClick={handleClick}
          >
            <Plus size={20} />
          </ActionIcon>
        </div>
      }
    >
      <EditForm initialValues={{ value: "" }} onSubmit={handleSubmit} />
    </Popover>
  );
};
