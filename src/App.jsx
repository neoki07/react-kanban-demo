import {
  Card,
  Grid,
  Divider,
  Badge,
  TextInput,
  Text,
  Popover,
  Group,
  Button,
  Paper,
  ActionIcon,
} from "@mantine/core";
import { useForm, useHover } from "@mantine/hooks";
import { useState } from "react";
import { Plus, X } from "tabler-icons-react";

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
  const { hovered, ref } = useHover();

  return (
    <Popover
      className="w-full"
      opened={opened}
      onClose={() => setOpened(false)}
      position="bottom"
      transition="scale-y"
      target={
        <Paper
          className="relative m-1 break-words border border-gray-200 px-4 py-3 hover:cursor-pointer hover:bg-gray-50"
          radius="sm"
          shadow="sm"
          onClick={() => setOpened((o) => !o)}
          ref={ref}
        >
          <Text>{item.text}</Text>
          {hovered && (
            <div className="absolute top-0 left-0 flex h-full w-full justify-end p-1">
              <ActionIcon
                className="h-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setColumns((prevColumns) =>
                    prevColumns.map((column) =>
                      column.id === columnId
                        ? {
                            ...column,
                            items: column.items.filter((i) => i.id !== item.id),
                          }
                        : column
                    )
                  );
                }}
              >
                <X size={14} />
              </ActionIcon>
            </div>
          )}
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

const AddButton = (props) => {
  const { columnId, setColumns, nextItemId, setNextItemId } = props;
  const [opened, setOpened] = useState(false);

  return (
    <Popover
      className="w-full"
      opened={opened}
      onClose={() => setOpened(false)}
      position="bottom"
      transition="scale-y"
      target={
        <div className="flex justify-center">
          <ActionIcon onClick={() => setOpened((o) => !o)}>
            <Plus size={20} />
          </ActionIcon>
        </div>
      }
    >
      <EditForm
        initialValues={{ text: "" }}
        onSubmit={(data) => {
          setNextItemId((id) => id + 1);
          setOpened(false);
          setColumns((prevColumns) =>
            prevColumns.map((column) =>
              column.id === columnId
                ? {
                    ...column,
                    items: [
                      ...column.items,
                      { id: nextItemId, text: data.text },
                    ],
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
  const [nextItemId, setNextItemId] = useState(initialColumns.length);

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
            <AddButton
              columnId={column.id}
              setColumns={setColumns}
              nextItemId={nextItemId}
              setNextItemId={setNextItemId}
            />
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );
};

export default App;
