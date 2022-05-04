import { CSS } from "@dnd-kit/utilities";
import { ActionIcon, Paper, Text } from "@mantine/core";
import { useHover, useMergedRef } from "@mantine/hooks";
import React from "react";
import { X } from "tabler-icons-react";

export const Item = React.memo(
  ({
    id,
    value,
    dragOverlay,
    dragging,
    setNodeRef,
    listeners,
    transition,
    transform,
    setContainers,
    findContainer,
    onClick,
  }) => {
    const { hovered, ref: hoverRef } = useHover();
    const mergedRef = useMergedRef(setNodeRef, hoverRef);

    return (
      <li className={`box-border flex ${dragOverlay && "z-[999]"}`}>
        <Paper
          className={`relative m-1 w-full break-words border border-gray-200 px-4 py-3 hover:cursor-pointer hover:bg-gray-50 ${
            dragging ? "opacity-50" : "opacity-100"
          }`}
          style={{
            transition,
            transform: CSS.Transform.toString(transform),
          }}
          ref={mergedRef}
          radius="sm"
          onClick={onClick}
          {...listeners}
        >
          <Text>{value}</Text>
          {hovered && !dragOverlay && (
            <div className="absolute top-0 left-0 flex h-full w-full justify-end p-0">
              <ActionIcon
                className="h-full bg-gray-100 hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setContainers((containers) => {
                    const containerId = findContainer(id);
                    return {
                      ...containers,
                      [containerId]: {
                        ...containers[containerId],
                        items: containers[containerId].items.filter(
                          (item) => item.id !== id
                        ),
                      },
                    };
                  });
                }}
              >
                <X size={14} />
              </ActionIcon>
            </div>
          )}
        </Paper>
      </li>
    );
  }
);

Item.displayName = "Item";
