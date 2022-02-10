import { Heading, Flex, Text } from "theme-ui";
import Container from "components/Container";
import Card from "components/Card/Default";
import { FiRss } from "react-icons/fi";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getUpdateVersionInfo } from "@src/modules/environment";

export default function Changelog() {
  const { updateVersion } = useSelector((store: SliceMachineStoreType) => ({
    updateVersion: getUpdateVersionInfo(store),
  }));

  return (
    <main>
      <Container sx={{ maxWidth: "1224px" }}>
        <Flex
          sx={{
            alignItems: "center",
            fontSize: 4,
            lineHeight: "48px",
            fontWeight: "heading",
            mb: 4,
          }}
        >
          <FiRss /> <Text ml={2}>Changelog</Text>
        </Flex>
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          updateVersion.availableVersions.map(({ version, releaseNote }) => (
            <Card
              key={version}
              sx={{
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unsafe-member-access
                border: (t) => `1px solid ${t.colors?.borders}`,
                mb: 4,
                "& li": {
                  listStyle: "initial",
                },
                "& ul": {
                  pl: 3,
                },
              }}
              HeaderContent={<Heading as="h3">v{version}</Heading>}
            >
              {releaseNote}
            </Card>
          ))
        }
      </Container>
    </main>
  );
}
