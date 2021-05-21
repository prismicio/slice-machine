import React, { useEffect } from "react";
import Head from "next/head";

import { mutate } from "swr";
import { useContext, Fragment } from "react";
import { FiLayers } from "react-icons/fi";
import { Box, Flex, Text } from "theme-ui";
import Container from "components/Container";
import SliceList from "components/SliceList";

import { LibrariesContext } from "src/models/libraries/context";

const UnclickableCardWrapper = ({ children }) => children;

const Index = () => {
  const libraries = useContext(LibrariesContext);

  return (
    <Fragment>
      <Head>
        <title>SliceMachine UI</title>
      </Head>
      <Container>
        <main>
          {libraries &&
            libraries.map(({ name, isLocal, components }, i) => (
              <div key={name}>
                <Flex
                  sx={{
                    alignItems: "center",
                    fontSize: 4,
                    lineHeight: "48px",
                    fontWeight: "heading",
                    mb: 4,
                    mt: i ? 4 : 0
                  }}
                >
                  <FiLayers /> <Text ml={2}>{name}</Text>
                </Flex>

                <SliceList
                  cardType="ForSlicePage"
                  {...(!isLocal
                    ? {
                        CardWrapper: UnclickableCardWrapper,
                      }
                    : null)}
                  slices={components.map(([e]) => e)}
                />
              </div>
            ))}
        </main>
      </Container>
    </Fragment>
  );
};

export default Index;
