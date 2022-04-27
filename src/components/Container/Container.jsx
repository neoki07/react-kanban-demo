import classNames from "classnames";
import React, { forwardRef } from "react";

import styles from "src/components/Container/Container.module.css";

export const Container = forwardRef(
  (
    {
      children,
      columns = 1,
      horizontal,
      onClick,
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
          placeholder && styles.placeholder,
          scrollable && styles.scrollable,
          shadow && styles.shadow
        )}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        {label ? <div className={styles.Header}>{label}</div> : null}
        {placeholder ? children : <ul>{children}</ul>}
      </Component>
    );
  }
);

Container.displayName = "Container";
