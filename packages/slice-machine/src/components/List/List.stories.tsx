import { Button, Switch, Text } from "@prismicio/editor-ui";
import type { Meta, StoryObj } from "@storybook/react";

import { List, ListHeader, ListItem } from "./List";

type Story = StoryObj<typeof meta>;

const meta = {
  component: List,
  argTypes: {
    children: { control: { disable: true } },
  },
} satisfies Meta<typeof List>;

export default meta;

export const Default = {
  args: {
    children: (
      <>
        <ListHeader
          actions={
            <>
              <Text color="grey11" component="span" noWrap>
                Show code snippets?
              </Text>
              <Switch size="small" />
              <Button startIcon="add" color="grey">
                Add
              </Button>
            </>
          }
        >
          Fields
        </ListHeader>
        <ListItem />
        <ListItem />
        <ListHeader
          actions={
            <Button startIcon="add" color="grey">
              Add
            </Button>
          }
          toggle={<Switch size="small" />}
        >
          Zone
        </ListHeader>
      </>
    ),
  },
} satisfies Story;
