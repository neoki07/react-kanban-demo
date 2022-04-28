import { Badge, Divider, Paper } from "@mantine/core";
import React, { forwardRef } from "react";

export const Container = forwardRef(
  ({ children, label, color, ...props }, ref) => {
    return (
      <Paper>
        <Badge className="flex justify-center" size="lg" color={color}>
          {label}
        </Badge>
        <Divider my="sm" variant="dotted" />
        <ul>{children}</ul>
      </Paper>
    );
  }
);

Container.displayName = "Container";
