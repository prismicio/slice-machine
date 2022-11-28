import SliceMachineModal from "@components/SliceMachineModal";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { Close, Flex, Heading, Text, useThemeUI } from "theme-ui";
import Card from "@components/Card";
import { MdOutlineDelete } from "react-icons/md";
import { Button } from "@components/Button";
import { deleteSlice } from "@src/apiClient";

type DeleteSliceModalProps = {
  sliceId: string;
  sliceName: string;
  libName: string;
};

export const DeleteSliceModal: React.FunctionComponent<
  DeleteSliceModalProps
> = ({ sliceId, sliceName, libName }) => {
  const { isSliceModalOpen } = useSelector((store: SliceMachineStoreType) => ({
    isSliceModalOpen: isModalOpen(store, ModalKeysEnum.DELETE_SLICE),
  }));

  const { closeDeleteSliceModal } = useSliceMachineActions();

  const { theme } = useThemeUI();

  return (
    <SliceMachineModal
      isOpen={isSliceModalOpen}
      shouldCloseOnOverlayClick={true}
      style={{
        content: {
          maxWidth: 612,
          borderRadius: "0px",
        },
      }}
      onRequestClose={closeDeleteSliceModal}
    >
      <Card
        radius={"0px"}
        bodySx={{
          p: 0,
          bg: "white",
          position: "relative",
          height: "100%",
          padding: 16,
        }}
        footerSx={{
          p: 0,
        }}
        sx={{ border: "none", borderRadius: "0px" }}
        borderFooter
        Header={() => (
          <Flex
            sx={{
              p: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: (t) => `1px solid ${String(t.colors?.borders)}`,
            }}
          >
            <Flex sx={{ alignItems: "center" }}>
              <MdOutlineDelete
                size={20}
                color={theme.colors?.greyIcon as string}
              />
              <Heading sx={{ fontSize: "14px", fontWeight: "bold", ml: 1 }}>
                Delete Slice
              </Heading>
            </Flex>
            <Close type="button" onClick={closeDeleteSliceModal} />
          </Flex>
        )}
        Footer={() => (
          <Flex
            sx={{
              justifyContent: "flex-end",
              height: 64,
              alignItems: "center",
              paddingRight: 16,
              borderTop: (t) => `1px solid ${String(t.colors?.darkBorders)}`,
              backgroundColor: "white",
            }}
          >
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => closeDeleteSliceModal()}
              sx={{
                mr: "10px",
                fontWeight: "bold",
                color: "grey12",
                borderRadius: 6,
              }}
            />
            <Button
              label="Delete"
              variant="danger"
              sx={{ minHeight: 39, minWidth: 78 }}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={async () => {
                await deleteSlice(sliceId, libName);
                closeDeleteSliceModal();
              }}
            />
          </Flex>
        )}
      >
        <Text>
          This action will delete the{" "}
          <Text sx={{ fontWeight: "bold" }}>
            `{libName}/{sliceName}/`
          </Text>
          directory and update associated files in the{" "}
          <Text sx={{ fontWeight: "bold" }}>`.slicemachine/`</Text>
          directory. It will also remove the Slice from the Slice Zones of any
          Custom Types that use it.
        </Text>
        <br />
        <Text>
          The next time you push changes to Prismic, the{" "}
          <Text sx={{ fontWeight: "bold" }}>"{sliceName}"</Text> Slice will be
          deleted from your repository, and users will no longer be able to add
          it to Documents. You will need to manually remove it from any
          Documents that currently use it.
        </Text>
      </Card>
    </SliceMachineModal>
  );
};
