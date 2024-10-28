import { Box, Flex, Heading, Text } from "theme-ui";

import { Card, useCardRadius } from "@/legacy/components/Card";
import Li from "@/legacy/components/Li";

const ConfigErrors = ({ errors }) => (
  <Card bg="background" bodySx={{ p: 3 }} Header={<CardHeader />}>
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

function CardHeader() {
  const radius = useCardRadius();
  return (
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
      <Heading as="h3">
        Your slicemachine.config.json file contains errors
      </Heading>
    </Flex>
  );
}

export default ConfigErrors;
