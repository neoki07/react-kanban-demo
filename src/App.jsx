import {
  Card,
  Grid,
  Divider,
  Badge,
  TextInput,
  Popover,
  Group,
  Button,
  Paper,
} from "@mantine/core";
import { useForm } from "@mantine/hooks";
import { useState } from "react";

const initialColumns = [
  {
    id: 1,
    name: "未着手",
    color: "blue",
    items: [
      { id: 1, text: "Todo 1" },
      { id: 2, text: "Todo 2" },
      { id: 3, text: "Todo 3" },
    ],
  },
  {
    id: 2,
    name: "対応中",
    color: "teal",
    items: [
      { id: 4, text: "Doing 1" },
      { id: 5, text: "Doing 2" },
      { id: 6, text: "Doing 3" },
    ],
  },
  {
    id: 3,
    name: "完了",
    color: "red",
    items: [
      { id: 7, text: "Done 1" },
      { id: 8, text: "Done 2" },
      { id: 9, text: "Done 3" },
    ],
  },
];

function EditForm({ initialValues, onSubmit, onCancel }) {
  const form = useForm({
    initialValues,
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Group position="apart">
        <TextInput
          required
          value={form.values.text}
          onChange={(event) =>
            form.setFieldValue("text", event.currentTarget.value)
          }
          error={form.errors.text}
          variant="default"
        />
        <Button
          className="bg-cyan-500 hover:bg-cyan-600"
          type="submit"
          size="sm"
        >
          Save
        </Button>
      </Group>
    </form>
  );
}

const KanbanItem = (props) => {
  const { item, columnId, setColumns } = props;
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      className="w-full"
      opened={opened}
      onClose={() => setOpened(false)}
      position="bottom"
      transition="scale-y"
      target={
        <Paper
          className="m-1 break-words border border-gray-200 px-4 py-3 hover:cursor-pointer hover:bg-gray-50"
          radius="sm"
          shadow="sm"
          onClick={() => setOpened((o) => !o)}
        >
          {item.text}
        </Paper>
      }
    >
      <EditForm
        initialValues={{ text: item.text }}
        onSubmit={(data) => {
          setOpened(false);
          setColumns((prevColumns) =>
            prevColumns.map((column) =>
              column.id === columnId
                ? {
                    ...column,
                    items: column.items.map((i) =>
                      i.id === item.id ? { ...i, text: data.text } : i
                    ),
                  }
                : column
            )
          );
        }}
      />
    </Popover>
  );
};

const App = () => {
  const [columns, setColumns] = useState(initialColumns);

  return (
    <div className="m-12">
      <Grid>
        {columns.map((column) => (
          <Grid.Col key={column.id} span={4}>
            <Card>
              <Badge
                className="flex justify-center"
                size="lg"
                color={column.color}
              >
                {column.name}
              </Badge>
              <Divider my="sm" variant="dotted" />

              {column.items.map((item) => (
                <KanbanItem
                  key={item.id}
                  item={item}
                  columnId={column.id}
                  setColumns={setColumns}
                />
              ))}
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );
};

export default App;
