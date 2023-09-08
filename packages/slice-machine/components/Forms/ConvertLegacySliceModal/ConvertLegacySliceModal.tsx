import { Box } from "theme-ui";
import ModalFormCard from "@components/ModalFormCard";
import { NonSharedSliceInSliceZone } from "@lib/models/common/CustomType/sliceZone";
import { useMemo } from "react";

interface FormValues {
  _foo?: "bar";
}

type ConvertLegacySliceModalProps = {
  isOpen: boolean;
  close: () => void;
  slice: NonSharedSliceInSliceZone;
  path: {
    customTypeID: string;
    tabID: string;
    sliceZoneID: string;
  };
};

export const ConvertLegacySliceModal: React.FC<
  ConvertLegacySliceModalProps
> = ({ isOpen, close, slice, path }) => {
  const convertLegacySliceAndTrack = ({}: FormValues) => {
    // convertLegacySlice();
    close();
  };

  const sliceName = useMemo(() => {
    return slice.value.type === "Slice"
      ? slice.value.fieldset ?? slice.key
      : slice.key;
  }, [slice]);

  return (
    <ModalFormCard
      dataCy="create-ct-modal"
      isOpen={isOpen}
      widthInPx="530px"
      formId="create-custom-type"
      buttonLabel={"Convert"}
      close={close}
      onSubmit={convertLegacySliceAndTrack}
      isLoading={false}
      initialValues={{}}
      validate={() => {
        return;
      }}
      content={{
        title: `Convert ${sliceName} to shared slice`,
      }}
    >
      {({}) => <Box>WIP {JSON.stringify(path)}</Box>}
    </ModalFormCard>
  );
};
