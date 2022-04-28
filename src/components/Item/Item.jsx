import { CSS } from "@dnd-kit/utilities";
import { Paper, Text } from "@mantine/core";
import classNames from "classnames";
import React, { useEffect } from "react";

import styles from "./Item.module.css";

export const Item = React.memo(
  React.forwardRef(
    (
      {
        // color,
        dragOverlay,
        dragging,
        // disabled,
        // fadeIn,
        // handle,
        // index,
        listeners,
        // sorting,
        // style,
        transition,
        transform,
        value,
        // wrapperStyle,
        // ...props
      },
      ref
    ) => {
      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = "grabbing";

        return () => {
          document.body.style.cursor = "";
        };
      }, [dragOverlay]);

      return (
        <li
          className={classNames(
            styles.Wrapper,
            dragOverlay && styles.dragOverlay
          )}
          style={{
            transition,
            transform: CSS.Transform.toString(transform),
            opacity: dragging ? 0.5 : 1,
          }}
          {...listeners}
          ref={ref}
        >
          {/* <div
            className={classNames(
              styles.Item,
              dragging && styles.dragging,
              dragOverlay && styles.dragOverlay
            )}
            {...listeners}
          >
            {value}
          </div> */}
          <Paper
            className="relative m-1 w-full break-words border border-gray-200 px-4 py-3 hover:cursor-pointer hover:bg-gray-50"
            radius="sm"
          >
            <Text>{value}</Text>
          </Paper>
        </li>
      );
    }
  )
);

Item.displayName = "Item";
