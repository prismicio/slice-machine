import { useContext, useEffect, useState } from "react";
import { Box, Flex, Heading, Button } from "theme-ui";
import { LibrariesContext } from "../../../../src/models/libraries/context";
import { SliceZoneAsArray } from "../../../../lib/models/common/CustomType/sliceZone";

import SliceState from "../../../models/ui/SliceState";
import LibraryState from "../../../models/ui/LibraryState";

import Form from "./Form";

import DefaultList from "./components/DefaultList";

const mapAvailableAndSharedSlices = (
  sliceZone: SliceZoneAsArray,
  libraries: ReadonlyArray<LibraryState> = []
) => {
  const availableSlices = libraries.reduce(
    (acc: ReadonlyArray<SliceState>, curr: LibraryState) => {
      return [...acc, ...curr.components.map((e) => e[0])];
    },
    []
  );
  const {
    slicesInSliceZone,
    notFound,
  }: {
    slicesInSliceZone: ReadonlyArray<SliceState>;
    notFound: ReadonlyArray<{ key: string }>;
  } = sliceZone.value.reduce(
    (acc: {
    slicesInSliceZone: ReadonlyArray<SliceState>;
    notFound: ReadonlyArray<{ key: string }>;
  }, { key }) => {
      const maybeSliceState = availableSlices.find(
        (state) => state.infos.meta.id === key
      );
      if (maybeSliceState) {
        return {
          ...acc,
          slicesInSliceZone: [...acc.slicesInSliceZone, maybeSliceState],
        };
      }
      return { ...acc, notFound: [...acc.notFound, { key }] };
    },
    { slicesInSliceZone: [], notFound: [] }
  );
  return { availableSlices, slicesInSliceZone, notFound };
};

const SliceZone = ({
  tabId,
  sliceZone,
  onSelectSharedSlices,
  onRemoveSharedSlice,
}: {
  tabId: string;
  sliceZone: SliceZoneAsArray;
  onSelectSharedSlices: Function;
  onRemoveSharedSlice: Function;
  onDelete: Function;
}) => {
  const [formIsOpen, setFormIsOpen] = useState(false);
  const libraries = useContext(LibrariesContext);

  const {
    availableSlices,
    slicesInSliceZone,
    notFound,
  } = mapAvailableAndSharedSlices(sliceZone, libraries as ReadonlyArray<LibraryState>);

  useEffect(() => {
    if (notFound?.length) {
      notFound.forEach(({ key }) => {
        onRemoveSharedSlice(key);
      });
    }
  }, [notFound]);

  return (
    <Box my={3}>
      <Flex
        bg="zoneHeader"
        sx={{
          pl: 3,
          pr: 2,
          py: 2,
          mb: 2,
          borderRadius: "6px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Flex sx={{ alignItems: "center" }}>
          <Heading as="h6">SliceZone</Heading>
          {/* Select the slices to use in this template */}
        </Flex>
        <Button variant="buttons.darkSmall" onClick={() => setFormIsOpen(true)}>
          Edit slices
        </Button>
      </Flex>
      <DefaultList cardType="ForSliceZone" slices={slicesInSliceZone} />
      {!slicesInSliceZone.length ? <p>no slices selected</p> : null}
      <Form
        isOpen={formIsOpen}
        formId={`tab-slicezone-form-${tabId}`}
        availableSlices={availableSlices}
        slicesInSliceZone={slicesInSliceZone}
        onSubmit={({ sliceKeys }: { sliceKeys: [string] }) =>
          onSelectSharedSlices(sliceKeys)
        }
        close={() => setFormIsOpen(false)}
      />
    </Box>
  );
};

export default SliceZone;
