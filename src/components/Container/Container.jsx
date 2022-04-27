import classNames from "classnames";
import React, { forwardRef } from "react";

import styles from "src/components/Container/Container.module.css";
// import { Handle } from "src/components/Handle";
// import { Remove } from "src/components/Remove";

export const Container = forwardRef(
  (
    {
      children,
      columns = 1,
      // handleProps,
      horizontal,
      // hover,
      onClick,
      // onRemove,
      label,
      placeholder,
      style,
      scrollable,
      shadow,
      unstyled,
      ...props
    },
    ref
  ) => {
    const Component = onClick ? "button" : "div";

    return (
      <Component
        {...props}
        ref={ref}
        style={{
          ...style,
          "--columns": columns,
        }}
        className={classNames(
          styles.Container,
          unstyled && styles.unstyled,
          horizontal && styles.horizontal,
          // hover && styles.hover,
          placeholder && styles.placeholder,
          scrollable && styles.scrollable,
          shadow && styles.shadow
        )}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        {label ? (
          <div className={styles.Header}>
            {label}
            {/* <div className={styles.Actions}>
              {onRemove ? <Remove onClick={onRemove} /> : undefined}
              <Handle {...handleProps} />
            </div> */}
          </div>
        ) : null}
        {placeholder ? children : <ul>{children}</ul>}
      </Component>
    );
  }
);

Container.displayName = "Container";
