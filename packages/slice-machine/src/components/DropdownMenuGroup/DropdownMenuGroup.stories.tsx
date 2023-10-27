import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  Icon,
} from "@prismicio/editor-ui";
import type { Meta, StoryFn, StoryObj } from "@storybook/react";

import {
  DropdownMenuGroupContent,
  DropdownMenuGroupLabel,
  DropdownMenuGroupItem,
} from "./DropdownMenuGroup";

type Story = StoryObj<typeof meta>;

const meta = {
  component: DropdownMenu,
  argTypes: { children: { control: { disable: true } } },
} satisfies Meta<typeof DropdownMenu>;

export default meta;

const DefaultDropdownMenu = (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button>Default</Button>
    </DropdownMenuTrigger>
    <DropdownMenuGroupContent align="start">
      <DropdownMenuGroupLabel>Label</DropdownMenuGroupLabel>
      <DropdownMenuGroupItem
        shortcut="⌘A"
        startIcon={<Icon name="folder" />}
        endIcon={<Icon name="folder" />}
      >
        Item
      </DropdownMenuGroupItem>
      <DropdownMenuGroupItem shortcut="⌘A" startIcon={<Icon name="folder" />}>
        Item
      </DropdownMenuGroupItem>
      <DropdownMenuGroupLabel>Label</DropdownMenuGroupLabel>
      <DropdownMenuGroupItem shortcut="⌘A" startIcon={<Icon name="folder" />}>
        Item
      </DropdownMenuGroupItem>
      <DropdownMenuGroupItem shortcut="⌘A" startIcon={<Icon name="folder" />}>
        Item
      </DropdownMenuGroupItem>
      <DropdownMenuGroupItem
        color="tomato"
        shortcut="⌘A"
        startIcon={<Icon name="folder" />}
      >
        Danger
      </DropdownMenuGroupItem>
      <DropdownMenuGroupItem
        disabled
        shortcut="⌘A"
        startIcon={<Icon name="folder" />}
      >
        Item blocked
      </DropdownMenuGroupItem>
      <DropdownMenuGroupItem
        color="tomato"
        disabled
        shortcut="⌘A"
        startIcon={<Icon name="folder" />}
      >
        Danger blocked
      </DropdownMenuGroupItem>
      <DropdownMenuGroupItem shortcut="⌘A" startIcon={<Icon name="folder" />}>
        Item
      </DropdownMenuGroupItem>
    </DropdownMenuGroupContent>
  </DropdownMenu>
);

const Template: StoryFn<typeof DropdownMenu> = () => (
  <div style={{ display: "flex", gap: 16 }}>{DefaultDropdownMenu}</div>
);

export const Default = {
  render: Template,
  name: "DropdownMenuGroup",
  args: { children: null },
} satisfies Story;
