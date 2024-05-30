import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Select,
  SelectItem,
  Skeleton,
  Text,
  theme,
} from "@prismicio/editor-ui";
import type { Meta, StoryObj } from "@storybook/react";

import { BitbucketIcon } from "../../icons/BitbucketIcon";
import { GitHubIcon } from "../../icons/GitHubIcon";
import { GitLabIcon } from "../../icons/GitLabIcon";
import {
  FieldSet,
  FieldSetContent,
  FieldSetFooter,
  FieldSetHeader,
  FieldSetLegend,
  FieldSetList,
  FieldSetListItem,
} from "./FieldSet";

type Story = StoryObj<typeof meta>;

const meta = {
  component: FieldSet,
  argTypes: {
    children: { control: { disable: true } },
  },
} satisfies Meta<typeof FieldSet>;

export default meta;

export const Default = {
  args: {
    children: (
      <>
        <FieldSetLegend />
        <FieldSetHeader />
        <FieldSetList>
          <FieldSetListItem action={<Button color="grey">Action</Button>} />
        </FieldSetList>
        <FieldSetFooter action={<IconButton icon="openInNew" />} />
      </>
    ),
  },
} satisfies Story;

export const WithButtonGroupContent = {
  args: {
    ...Default.args,
    children: (
      <>
        <FieldSetLegend>Connected Git Repository</FieldSetLegend>
        <FieldSetContent>
          <ButtonGroup color="grey">
            <Button
              renderStartIcon={() => <GitHubIcon color={theme.color.grey11} />}
              sx={{ flexBasis: 0, flexGrow: 1 }}
            >
              GitHub
            </Button>
            <Button
              disabled
              renderStartIcon={() => (
                <BitbucketIcon color={theme.color.grey11} />
              )}
              sx={{ flexBasis: 0, flexGrow: 1 }}
            >
              Bitbucket{" "}
              <Text color="inherit" variant="small">
                (soon)
              </Text>
            </Button>
            <Button
              disabled
              renderStartIcon={() => <GitLabIcon color={theme.color.grey11} />}
              sx={{ flexBasis: 0, flexGrow: 1 }}
            >
              GitLab{" "}
              <Text color="inherit" variant="small">
                (soon)
              </Text>
            </Button>
          </ButtonGroup>
        </FieldSetContent>
        <FieldSetFooter action={<IconButton icon="openInNew" />}>
          Learn more about Prismic for Git
        </FieldSetFooter>
      </>
    ),
  },
  parameters: { controls: { hideNoControlsWarning: true, include: [] } },
} satisfies Story;

export const LoadingWithHeaderAndList = {
  args: {
    ...Default.args,
    children: (
      <>
        <FieldSetLegend>Connected Git Repository</FieldSetLegend>
        <FieldSetHeader>
          <OwnerSelect disabled />
        </FieldSetHeader>
        <FieldSetList>
          {[...Array(4).keys()].map((index) => (
            <FieldSetListItem
              action={<Skeleton height={32} width={67.59} />}
              key={index}
            >
              <Skeleton
                height={24}
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore TODO(DT-1918): add `verticalAlign: "middle"` to the `sx` prop.
                sx={{ verticalAlign: "middle" }}
                width={129.92}
              />
            </FieldSetListItem>
          ))}
        </FieldSetList>
        <FieldSetFooter action={<IconButton icon="openInNew" />}>
          Learn more about Prismic for Git
        </FieldSetFooter>
      </>
    ),
  },
  parameters: { controls: { hideNoControlsWarning: true, include: [] } },
};

export const WithHeaderAndListOverflow = {
  args: {
    ...Default.args,
    children: (
      <>
        <FieldSetLegend>Connected Git Repository</FieldSetLegend>
        <FieldSetHeader>
          <OwnerSelect />
        </FieldSetHeader>
        <FieldSetList>
          {[...Array(100).keys()].map((index) => (
            <FieldSetListItem
              action={<Button color="grey">Connect</Button>}
              key={index}
            >
              Repository <Text color="grey11">• xd ago</Text>
            </FieldSetListItem>
          ))}
        </FieldSetList>
        <FieldSetFooter action={<IconButton icon="openInNew" />}>
          Learn more about Prismic for Git
        </FieldSetFooter>
      </>
    ),
  },
  parameters: { controls: { hideNoControlsWarning: true, include: [] } },
};

export const WithSingleListItem = {
  args: {
    ...Default.args,
    children: (
      <>
        <FieldSetLegend>Connected Git Repository</FieldSetLegend>
        <FieldSetList>
          <FieldSetListItem action={<Button color="grey">Disconnect</Button>}>
            Repository <Text color="grey11">• xd ago</Text>
          </FieldSetListItem>
        </FieldSetList>
        <FieldSetFooter action={<IconButton icon="openInNew" />}>
          Learn more about Prismic for Git
        </FieldSetFooter>
      </>
    ),
  },
  parameters: { controls: { hideNoControlsWarning: true, include: [] } },
};

export const WithHeaderAndBoxContent = {
  args: {
    ...Default.args,
    children: (
      <>
        <FieldSetLegend>Connected Git Repository</FieldSetLegend>
        <FieldSetHeader>
          <OwnerSelect />
        </FieldSetHeader>
        <FieldSetContent>
          <Box
            flexDirection="column"
            /*
             * TODO: these `padding` values actually don't match Figma, but they
             * are the closest allowed by the `Box` component.
             */
            padding={{ block: 72, inline: 100 }}
          >
            <Text align="center" variant="emphasized">
              No Results Found
            </Text>
            <Text align="center" color="grey11">
              Try selecting a different Git account or organization on the top
              left.
            </Text>
          </Box>
        </FieldSetContent>
        <FieldSetFooter action={<IconButton icon="openInNew" />}>
          Learn more about Prismic for Git
        </FieldSetFooter>
      </>
    ),
  },
  parameters: { controls: { hideNoControlsWarning: true, include: [] } },
};

type OwnerSelectProps = { disabled?: boolean };

function OwnerSelect(props: OwnerSelectProps) {
  return (
    <Select
      {...props}
      color="grey"
      constrainContentWidth
      flexContent
      placeholder="Owner"
      renderStartIcon={() => <GitHubIcon color={theme.color.grey11} />}
      size="large"
      sx={{ width: "calc(50% - 8px)" }}
    >
      {[...Array(2).keys()].map((index) => (
        <SelectItem
          key={index}
          renderStartIcon={() => <GitHubIcon color={theme.color.grey11} />}
          size="large"
          value={`owner-${index}`}
        >
          Owner
        </SelectItem>
      ))}
    </Select>
  );
}
