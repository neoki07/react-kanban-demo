import { Group, TextInput, Button } from "@mantine/core";
import { useForm } from "@mantine/hooks";

export const EditForm = ({ initialValues, onSubmit }) => {
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
            form.setFieldValue("value", event.currentTarget.value)
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
};
