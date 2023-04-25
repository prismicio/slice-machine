import { Text, Flex, Heading } from "theme-ui";

import Card from "../Card";

const AuthInstructions = () => (
  <Card
    borderFooter
    bg="gray"
    bodySx={{ p: 3 }}
    sx={{ maxWidth: "480px", m: 3 }}
    Header={({ radius }) => (
      <Flex
        sx={{
          p: 3,
          pl: 4,
          bg: "headSection",
          alignItems: "center",
          justifyContent: "space-between",
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          borderBottom: (t) => `1px solid ${t.colors?.borders}`,
        }}
      >
        <Heading as="h3">Log in to Prismic</Heading>
      </Flex>
    )}
  >
    <Text as="p">
      In order to access your builder, you will need to be connected to Prismic.
      If you haven't already created a project, please{" "}
      <b>run the setup command</b> first:
      <Text mt={1}>
        <pre>prismic sm --setup</pre>
      </Text>
      <Text mt={1}>
        👆 This needs to be done inside a valid Next/Nuxt project.
      </Text>
      <Text mt={3}>
        <b>Otherwise, simply run:</b>
      </Text>
      <Text mt={1}>
        <pre>prismic login</pre>
      </Text>
    </Text>
  </Card>
);

export default AuthInstructions;
