/* eslint-disable */
import useSwr from "swr";
import { Box, Flex, Text } from "theme-ui";
import Container from "../components/Container";
import { FiRss } from "react-icons/fi";
import { Fragment } from "react";

async function fetcher(url: string): Promise<any> {
  return fetch(url).then((res) => res.json());
}

const LoadingOrError = ({
  data,
}: {
  data: { err: string; connected?: boolean } | undefined;
}) => (
  <Box sx={{ border: "1px solid pink", p: 2 }}>
    {data?.err ? (
      "Could not log in, retry!"
    ) : (
      <Fragment>
        {data?.connected === false ? (
          <p>Please connect using `prismic login` CLI command</p>
        ) : (
          "Loading"
        )}
      </Fragment>
    )}
  </Box>
);

export default function Changelog() {
  const { data } = useSwr("/api/auth/validate", fetcher);
  return (
    <Container sx={{ maxWidth: "924px" }}>
      <Flex
        sx={{
          alignItems: "center",
          fontSize: 4,
          lineHeight: "48px",
          fontWeight: "heading",
          mb: 4,
        }}
      >
        <FiRss /> <Text ml={2}>Welcome!</Text>
      </Flex>
      {!data || data.err || !data.body ? (
        <LoadingOrError data={data} />
      ) : (
        <Fragment>
          <Box sx={{ border: "1px solid pink", p: 2 }}>
            Logged in as {data.body.email}
          </Box>
          <Box sx={{ border: "1px solid pink", p: 2, mt: 3 }}>
            <h3>Select your Prismic project</h3>
            {Object.entries(JSON.parse(data.body.repositories)).map(
              ([repo]) => (
                <p key={repo}>{repo}</p>
              )
            )}
          </Box>
        </Fragment>
      )}
    </Container>
  );
}
