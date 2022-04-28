import { Badge, Divider, Paper } from "@mantine/core";
import React, { forwardRef } from "react";

export const Container = forwardRef(
  (
    {
      children,
      columns = 1,
      // horizontal,
      // onClick,
      label,
      // placeholder,
      // style,
      // scrollable,
      // shadow,
      // unstyled,
      ...props
    },
    ref
  ) => {
    // const Component = "div";
    // const Component = onClick ? "button" : "div";

    return (
      <Paper>
        <Badge className="flex justify-center" size="lg">
          {label}
        </Badge>
        <Divider my="sm" variant="dotted" />
        {/* <div
          {...props}
          ref={ref}
          style={{
            // ...style,
            "--columns": columns,
          }}
          className={classNames(
            styles.Container
            // unstyled && styles.unstyled,
            // horizontal && styles.horizontal,
            // placeholder && styles.placeholder,
            // scrollable && styles.scrollable,
            // shadow && styles.shadow
          )}
          // onClick={onClick}
          // tabIndex={onClick ? 0 : undefined}
        >
          {label ? <div className={styles.Header}>{label}</div> : null} */}
        <ul>{children}</ul>
        {/* {label ? <div className={styles.Header}>{label}</div> : null}
        {placeholder ? children : <ul>{children}</ul>} */}
        {/* </div> */}
      </Paper>
    );
  }
);

Container.displayName = "Container";
