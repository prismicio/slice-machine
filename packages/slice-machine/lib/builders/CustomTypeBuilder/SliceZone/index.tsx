import { useEffect, useState } from "react";
import { Text, Box, Flex, Heading, Button } from "theme-ui";

import ZoneHeader from "../../common/Zone/components/ZoneHeader";

import UpdateSliceZoneModal from "./UpdateSliceZoneModal";

import { SlicesList } from "./List";
import EmptyState from "./EmptyState";
import { SlicesSM } from "@prismic-beta/slicemachine-core/build/models/Slices";
import { SlicesTypes } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import {
  NonSharedSliceInSliceZone,
  SliceZoneSlice,
} from "@lib/models/common/CustomType/sliceZone";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { getFrontendSlices, getLibraries } from "@src/modules/slices";
import { ComponentUI } from "@lib/models/common/ComponentUI";
import { LibraryUI } from "@lib/models/common/LibraryUI";
import { useModelStatus } from "@src/hooks/useModelStatus";

const mapAvailableAndSharedSlices = (
  sliceZone: SlicesSM,
  libraries: ReadonlyArray<LibraryUI> | null
) => {
  const availableSlices = (libraries || []).reduce<ReadonlyArray<ComponentUI>>(
    (acc, curr: LibraryUI) => {
      return [...acc, ...curr.components];
    },
    []
  );
  const {
    slicesInSliceZone,
    notFound,
  }: {
    slicesInSliceZone: ReadonlyArray<SliceZoneSlice>;
    notFound: ReadonlyArray<{ key: string }>;
  } = sliceZone.value.reduce(
    (
      acc: {
        slicesInSliceZone: ReadonlyArray<SliceZoneSlice>;
        notFound: ReadonlyArray<{ key: string }>;
      },
      { key, value }
    ) => {
      if (value.type === SlicesTypes.Slice) {
        return {
          ...acc,
          slicesInSliceZone: [
            ...acc.slicesInSliceZone,
            { type: SlicesTypes.Slice, payload: { key, value } },
          ],
        };
      }
      const maybeSliceState: ComponentUI | undefined = availableSlices.find(
        (slice) => slice.model.id === key
      );

      if (maybeSliceState) {
        return {
          ...acc,
          slicesInSliceZone: [
            ...acc.slicesInSliceZone,
            { type: SlicesTypes.SharedSlice, payload: maybeSliceState },
          ],
        };
      }
      return { ...acc, notFound: [...acc.notFound, { key }] };
    },
    { slicesInSliceZone: [], notFound: [] }
  );
  return { availableSlices, slicesInSliceZone, notFound };
};

interface SliceZoneProps {
  tabId: string;
  sliceZone?: SlicesSM | null | undefined;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onSelectSharedSlices: Function;
  onRemoveSharedSlice: (sliceId: string) => void;
  onCreateSliceZone: () => void;
}

const SliceZone: React.FC<SliceZoneProps> = ({
  tabId,
  sliceZone,
  onSelectSharedSlices,
  onRemoveSharedSlice,
  onCreateSliceZone,
}) => {
  const [formIsOpen, setFormIsOpen] = useState(false);
  const { libraries, frontendSlices } = useSelector(
    (store: SliceMachineStoreType) => ({
      libraries: getLibraries(store),
      frontendSlices: getFrontendSlices(store),
    })
  );

  const { modelsStatuses, authStatus, isOnline } =
    useModelStatus(frontendSlices);

  const { availableSlices, slicesInSliceZone, notFound } = sliceZone
    ? mapAvailableAndSharedSlices(sliceZone, libraries)
    : { availableSlices: [], slicesInSliceZone: [], notFound: [] };

  useEffect(() => {
    if (notFound?.length) {
      notFound.forEach(({ key }) => {
        onRemoveSharedSlice(key);
      });
    }
  }, [notFound]);

  const sharedSlicesInSliceZone = slicesInSliceZone
    .filter((e) => e.type === SlicesTypes.SharedSlice)
    .map((e) => e.payload) as ReadonlyArray<ComponentUI>;

  /* Preserve these keys in SliceZone */
  const nonSharedSlicesKeysInSliceZone = slicesInSliceZone
    .filter((e) => e.type === SlicesTypes.Slice)
    .map((e) => (e.payload as NonSharedSliceInSliceZone).key);

  const onAddNewSlice = () => {
    if (!sliceZone) {
      onCreateSliceZone();
    }
    setFormIsOpen(true);
  };

  return (
    <Box my={3}>
      <ZoneHeader
        Heading={<Heading as="h6">Slice Zone</Heading>}
        Actions={
          <Flex sx={{ alignItems: "center" }}>
            {sliceZone ? (
              <Text pr={3} sx={{ fontSize: "14px" }}>
                data.{sliceZone.key}
              </Text>
            ) : null}
            {!!slicesInSliceZone.length && (
              <Button variant="buttons.darkSmall" onClick={onAddNewSlice}>
                Update Slice Zone
              </Button>
            )}
          </Flex>
        }
      />
      {!slicesInSliceZone.length ? (
        <EmptyState onAddNewSlice={onAddNewSlice} />
      ) : (
        <SlicesList
          slices={slicesInSliceZone}
          modelsStatuses={modelsStatuses}
          authStatus={authStatus}
          isOnline={isOnline}
        />
      )}
      <UpdateSliceZoneModal
        isOpen={formIsOpen}
        formId={`tab-slicezone-form-${tabId}`}
        availableSlices={availableSlices}
        slicesInSliceZone={sharedSlicesInSliceZone}
        onSubmit={({ sliceKeys }) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          onSelectSharedSlices(sliceKeys, nonSharedSlicesKeysInSliceZone)
        }
        close={() => setFormIsOpen(false)}
      />
    </Box>
  );
};

export default SliceZone;
