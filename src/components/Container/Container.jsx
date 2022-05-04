import { Badge, Divider, Paper } from "@mantine/core";

export const Container = ({ children, label, color }) => {
  return (
    <Paper>
      <Badge className="flex justify-center" size="lg" color={color}>
        {label}
      </Badge>
      <Divider my="sm" variant="dotted" />
      <ul>{children}</ul>
    </Paper>
  );
};
