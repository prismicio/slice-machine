import { Text, Flex, Heading } from "theme-ui";

import Card from "../Card";

export const ClientError = ({ errorType }) => (
  <Card
    bg="background"
    bodySx={{ p: 3 }}
    Header={({ radius }) => (
      <Flex
        sx={{
          p: 3,
          alignItems: "center",
          justifyContent: "space-between",
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          borderBottom: (t) => `1px solid ${t.colors?.borders}`,
        }}
      >
        <Heading as="h3">Unable to fetch remote slices</Heading>
      </Flex>
    )}
  >
    <Text as="p" mt={1}>
      This error probably means that you are not connected to Prismic or that
      your `prismic-auth` token is outdated.
    </Text>
    <Text as="p">
      To generate a new token, type `prismic login` in your CLI. This message
      you should disappear instantly.
    </Text>
    <Text as="p" mt={4}>
      If the problem persists, check that your `sm.json` file points to the
      right API endpoint.
      <br />
      Full error: {errorType}
    </Text>
  </Card>
);

export const NotConnected = () => (
  <Card
    bg="background"
    bodySx={{ p: 3 }}
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
        <Heading as="h3">You're not logged in</Heading>
      </Flex>
    )}
  >
    <Text as="p">
      In order to push your slices to your Shared Slices bucket, you will need
      to be connected to Prismic. If you haven't already created a project,
      please <b>run the setup command</b> first:
      <Text variant="pre">prismic sm --setup</Text>
      <Text mt={1}>
        👆 This needs to be done inside a valid Next/Nuxt project.
      </Text>
      <Text mt={3}>
        <b>Otherwise, simply run:</b>
      </Text>
      <Text mt={1}>prismic login</Text>
    </Text>
  </Card>
);

export const NewVersionAvailable = ({ value: { current, next, message } }) => (
  <Card
    bg="background"
    bodySx={{ p: 3 }}
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
        <Heading as="h3">New version available</Heading>
      </Flex>
    )}
  >
    <Text as="p">
      A new version of the slice builder is available (<b>{next}</b>).
      <br />
    </Text>
    Please run: <Text variant="pre">{message}</Text>
    to update it to latest version!
  </Card>
);
