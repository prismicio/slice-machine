import {
  Badge,
  Box,
  Button,
  Checkbox,
  IconButton,
  Text,
  theme,
} from "@prismicio/editor-ui";
import type { Meta, StoryObj } from "@storybook/react";

import { AddPhotoAlternateIcon } from "@/icons/AddPhotoAlternateIcon";
import { ArrowDropDownIcon } from "@/icons/ArrowDropDownIcon";
import { SyncAltIcon } from "@/icons/SyncAltIcon";

import { Card, CardActions, CardFooter, CardMedia, CardStatus } from "./Card";

type Story = StoryObj<typeof meta>;

const meta = {
  component: Card,
  argTypes: {
    children: { control: { disable: true } },
    component: { control: { disable: true }, if: { arg: "interactive" } },
    disabled: { if: { arg: "interactive" } },
    href: { if: { arg: "interactive" } },
    onClick: { if: { arg: "interactive" } },
    replace: { if: { arg: "interactive" } },
    size: { control: "select", options: ["small", "medium"] },
    variant: { control: "select", options: ["solid", "outlined"] },
  },
} satisfies Meta<typeof Card>;

export default meta;

export const Default = {
  args: {
    checked: false,
    children: (
      <>
        <CardMedia overlay={<></>} />
        <CardActions />
        <CardFooter
          action={<Button color="grey">Action</Button>}
          subtitle="Subtitle"
          title="Title"
        />
        <CardStatus />
      </>
    ),
    interactive: false,
    size: "medium",
    variant: "solid",
  },
} satisfies Story;

export const SolidWithImg = {
  args: {
    ...Default.args,
    children: (
      <>
        <CardMedia
          overlay={
            <Box alignItems="center" justifyContent="center">
              <Button
                renderStartIcon={() => (
                  <AddPhotoAlternateIcon color={theme.color.grey11} />
                )}
                color="grey"
              >
                Update screenshot
              </Button>
            </Box>
          }
          src="https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=512"
        />
        <CardFooter
          action={<IconButton icon="close" />}
          subtitle="Default • Edited 19 minutes ago"
          title="Hello"
        />
        <CardStatus>Missing screenshot</CardStatus>
      </>
    ),
    interactive: true,
    style: { width: "448px" },
  },
  parameters: { controls: { hideNoControlsWarning: true, include: [] } },
} satisfies Story;

export const SolidWithDiv = {
  args: {
    ...SolidWithImg.args,
    children: (
      <>
        <CardMedia component="div">
          <Box alignItems="center" justifyContent="center">
            <Text color="grey11" component="span">
              No screenshot available
            </Text>
          </Box>
        </CardMedia>
        <CardActions>
          <Badge color="purple" title="Legacy Slice" />
          <Button
            renderEndIcon={() => (
              <ArrowDropDownIcon color={theme.color.grey11} />
            )}
            renderStartIcon={() => <SyncAltIcon color={theme.color.grey11} />}
            color="grey"
          >
            Turn into shared Slice
          </Button>
        </CardActions>
        <CardFooter subtitle="Default • Edited 19 minutes ago" title="Hello" />
      </>
    ),
    interactive: false,
  },
  parameters: SolidWithImg.parameters,
} satisfies Story;

export const OutlinedWithImg = {
  args: {
    ...Default.args,
    children: (
      <>
        <CardMedia src="https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=512" />
        <CardFooter
          action={<Checkbox />}
          subtitle="Library • Edited 19 minutes ago"
          title="Name"
        />
      </>
    ),
    interactive: true,
    size: "small",
    style: { width: "320px" },
    variant: "outlined",
  },
  parameters: { controls: { hideNoControlsWarning: true, include: [] } },
} satisfies Story;

export const OutlinedWithDiv = {
  args: {
    ...OutlinedWithImg.args,
    children: (
      <>
        <CardMedia component="div">
          <Box alignItems="center" justifyContent="center">
            <Text color="grey11" component="span">
              No screenshot available
            </Text>
          </Box>
        </CardMedia>
        <CardFooter
          action={<Checkbox />}
          subtitle="Library • Edited 19 minutes ago"
          title="Name"
        />
      </>
    ),
  },
  parameters: OutlinedWithImg.parameters,
} satisfies Story;
