import { Text, Flex, Heading } from "theme-ui";

import Card from "../Card";

export const StorybookNotInstalled = () => (
  <Card
    bg="background"
    bodySx={{ p: 3 }}
    sx={{ mb: 4 }}
    Header={({ radius }) => (
      <Flex
        sx={{
          p: 3,
          bg: "headSection",
          alignItems: "center",
          justifyContent: "space-between",
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          borderBottom: (t) => `1px solid ${t.colors?.borders}`,
        }}
      >
        <Heading as="h3">Storybook is not installed</Heading>
      </Flex>
    )}
  >
    <Text as="p">
      In order to save the screenshots of your components, Storybook needs to be
      running. It seems Storybook is not configured in yur project. Please{" "}
      <b>run this command</b> first:
      <Text variant="pre">prismic sm --add-storybook</Text>
      <Text mt={1}>
        👆 This needs to be done inside a valid Next/Nuxt project.
      </Text>
    </Text>
  </Card>
);

export const StorybookNotRunning = () => (
  <Card
    bg="background"
    bodySx={{ p: 3 }}
    sx={{ mb: 4 }}
    Header={({ radius }) => (
      <Flex
        sx={{
          p: 3,
          bg: "headSection",
          alignItems: "center",
          justifyContent: "space-between",
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          borderBottom: (t) => `1px solid ${t.colors?.borders}`,
        }}
      >
        <Heading as="h3">Storybook is not running</Heading>
      </Flex>
    )}
  >
    <Text as="p">
      In order to save the screenshots of your components, Storybook needs to be
      running. If you configured it already, simply type
      <Text variant="pre">yarn run storybook</Text>
      <Text mt={2}>If you haven't configured it yet, try running</Text>
      <Text variant="pre">prismic sm --add-storybook</Text>
      <Text mt={1}>
        👆 This needs to be done inside a valid Next/Nuxt project.
      </Text>
    </Text>
  </Card>
);

export const StorybookNotInManifest = () => (
  <Card
    bg="background"
    bodySx={{ p: 3 }}
    sx={{ mb: 4 }}
    Header={({ radius }) => (
      <Flex
        sx={{
          p: 3,
          bg: "headSection",
          alignItems: "center",
          justifyContent: "space-between",
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          borderBottom: (t) => `1px solid ${t.colors?.borders}`,
        }}
      >
        <Heading as="h3">Missing property "storybook" in manifest</Heading>
      </Flex>
    )}
  >
    <Text as="p">
      In order to save the screenshots of your components, Storybook needs to be
      running. For that, the builder needs to know which port of localhost,
      Storybook uses. Add this property to your sm.json file:
      <Text variant="pre">{`"storybook": "http://localhost:[port]"`}</Text>
    </Text>
  </Card>
);
