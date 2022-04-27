import classNames from "classnames";
import React, { useEffect } from "react";

import styles from "./Item.module.css";

// import { Handle } from "src/components/Handle";
// import { Remove } from "src/components/Remove";

export const Item = React.memo(
  React.forwardRef(
    (
      {
        color,
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        // height,
        index,
        listeners,
        // onRemove,
        // renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        ...props
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
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            dragOverlay && styles.dragOverlay
          )}
          style={{
            ...wrapperStyle,
            transition: [
              transition,
              wrapperStyle ? wrapperStyle.transition : null,
            ]
              .filter(Boolean)
              .join(", "),
            "--translate-x": transform
              ? `${Math.round(transform.x)}px`
              : undefined,
            "--translate-y": transform
              ? `${Math.round(transform.y)}px`
              : undefined,
            "--scale-x": transform
              ? transform.scaleX
                ? `${transform.scaleX}`
                : undefined
              : null,
            "--scale-y": transform
              ? transform.scaleY
                ? `${transform.scaleY}`
                : undefined
              : null,
            "--index": index,
            "--color": color,
            opacity: dragging ? 0.5 : 1,
          }}
          ref={ref}
        >
          <div
            className={classNames(
              styles.Item,
              dragging && styles.dragging,
              handle && styles.withHandle,
              dragOverlay && styles.dragOverlay,
              disabled && styles.disabled,
              color && styles.color
            )}
            style={style}
            data-cypress="draggable-item"
            {...(!handle ? listeners : undefined)}
            {...props}
            tabIndex={!handle ? 0 : undefined}
          >
            {value}
            {/* <span className={styles.Actions}>
              {onRemove ? (
                <Remove className={styles.Remove} onClick={onRemove} />
              ) : null}
              {handle ? <Handle {...listeners} /> : null}
            </span> */}
          </div>
        </li>
      );
    }
  )
);

Item.displayName = "Item";
