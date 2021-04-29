import React, { useEffect } from "react";
import Head from "next/head";

import { mutate } from "swr";
import { useContext, Fragment } from "react";

import { Box } from "theme-ui";
import Container from "components/Container";
import SliceList from "components/SliceList";

import { LibrariesContext } from "src/models/libraries/context";

const Index = () => {
  const libraries = useContext(LibrariesContext);
  console.log({ libraries });
  return (
    <Fragment>
      <Head>
        <title>SliceMachine UI</title>
      </Head>
      <Container>
        <main>
          {libraries &&
            libraries.map(
              ({ name, components }) =>
                console.log(components.map(([e]) => e)) || (
                  <div key={name}>
                    <Box
                      as="h2"
                      sx={{
                        pb: 3,
                      }}
                    >
                      {name}
                    </Box>
                    <SliceList
                      cardType="ForSlicePage"
                      slices={components.map(([e]) => e)}
                    />
                  </div>
                )
            )}
        </main>
      </Container>
    </Fragment>
  );
};

export default Index;
