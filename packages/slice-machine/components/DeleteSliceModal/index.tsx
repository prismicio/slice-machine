import SliceMachineModal from "@components/SliceMachineModal";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { isModalOpen } from "@src/modules/modal";
import { ModalKeysEnum } from "@src/modules/modal/types";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { Close, Flex, Heading, Paragraph, Text, useThemeUI } from "theme-ui";
import Card from "@components/Card";
import { MdOutlineDelete } from "react-icons/md";
import { Button } from "@components/Button";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { isLoading } from "@src/modules/loading";

type DeleteSliceModalProps = {
  sliceId: string;
  sliceName: string;
  libName: string;
};

export const DeleteSliceModal: React.FunctionComponent<
  DeleteSliceModalProps
> = ({ sliceId, sliceName, libName }) => {
  const { isSliceModalOpen, isDeletingSlice } = useSelector(
    (store: SliceMachineStoreType) => ({
      isSliceModalOpen: isModalOpen(store, ModalKeysEnum.DELETE_SLICE),
      isDeletingSlice: isLoading(store, LoadingKeysEnum.DELETE_SLICE),
    })
  );

  const { closeModals, deleteSlice } = useSliceMachineActions();

  const { theme } = useThemeUI();

  return (
    <SliceMachineModal
      isOpen={isSliceModalOpen}
      shouldCloseOnOverlayClick={true}
      style={{
        content: {
          maxWidth: 612,
        },
      }}
      onRequestClose={closeModals}
    >
      <Card
        bodySx={{
          p: 0,
          bg: "white",
          position: "relative",
          height: "100%",
          padding: 16,
        }}
        footerSx={{
          position: "sticky",
          bottom: 0,
          p: 0,
        }}
        sx={{ border: "none" }}
        borderFooter
        Header={() => (
          <Flex
            sx={{
              position: "sticky",
              background: "gray",
              top: 0,
              zIndex: 1,
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
            <Close type="button" onClick={closeModals} />
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
              backgroundColor: "gray",
            }}
          >
            <Button
              label="Cancel"
              variant="secondary"
              onClick={() => closeModals()}
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
              isLoading={isDeletingSlice}
              sx={{ minHeight: 39, minWidth: 78 }}
              onClick={() => deleteSlice(sliceId, sliceName, libName)}
            />
          </Flex>
        )}
      >
        <Paragraph>
          This action will immediately make the following changes:
          <ul>
            <li>
              Delete the{" "}
              <Text sx={{ fontWeight: "bold" }}>
                {libName}/{sliceName}/
              </Text>{" "}
              directory.
            </li>
            <li>Remove the Slice from all Slice Zones that use it.</li>
          </ul>
          The next time you push your changes to Prismic, the following change
          will happen:
          <ul>
            <li>
              Remove the Slice from the list of available Slices to use in the
              Page Builder.
            </li>
          </ul>
          You will need to manually remove the Slice from any Pages that
          currently use it.
        </Paragraph>
      </Card>
    </SliceMachineModal>
  );
};
