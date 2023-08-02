import { Box, Heading, Flex, Text } from "theme-ui";
import Card from "@components/Card";
import Li from "@components/Li";

const ConfigErrors = ({ errors }) => (
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
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          borderBottom: (t) => `1px solid ${t.colors?.borders}`,
        }}
      >
        <Heading as="h3">Your sm.json file contains errors</Heading>
      </Flex>
    )}
  >
    {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Object.entries(errors).map(([key, value]) => (
        <Li Component={Box} key={key} sx={{ m: 0, p: 1 }}>
          <Text>
            - <b>{key}</b>
          </Text>
          <br />
          <Text>
            {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              value.message
            }
          </Text>
          <br />
          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
            value.run ? (
              <Text mt={1}>
                Try running:{" "}
                <Text variant="pre">
                  {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    value.run
                  }
                </Text>
              </Text>
            ) : null
          }

          {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions
            value.do ? <Text mt={1}>Todo: {value.do}</Text> : null
          }
        </Li>
      ))
    }
  </Card>
);

export default ConfigErrors;
