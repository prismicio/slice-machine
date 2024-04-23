import { useState } from "react";
import { MdOutlineDelete } from "react-icons/md";
import { Close, Flex, Heading, Paragraph, Text, useThemeUI } from "theme-ui";

import { deleteSlice } from "@/features/slices/actions/deleteSlice";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import { Button } from "@/legacy/components/Button";
import Card from "@/legacy/components/Card";
import SliceMachineModal from "@/legacy/components/SliceMachineModal";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

type DeleteSliceModalProps = {
  isOpen: boolean;
  libName: string;
  sliceId: string;
  sliceName: string;
  onClose: () => void;
};

export const DeleteSliceModal: React.FunctionComponent<
  DeleteSliceModalProps
> = ({ sliceId, sliceName, libName, isOpen, onClose }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteSliceSuccess } = useSliceMachineActions();
  const { syncChanges } = useAutoSync();
  const { theme } = useThemeUI();

  const onDelete = async () => {
    setIsDeleting(true);

    await deleteSlice({
      sliceID: sliceId,
      sliceName,
      libraryID: libName,
      onSuccess: () => {
        deleteSliceSuccess(sliceId, libName);
        syncChanges();
      },
    });

    onClose();
    setIsDeleting(false);
  };

  return (
    <SliceMachineModal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={true}
      style={{
        content: {
          maxWidth: 612,
        },
      }}
      onRequestClose={onClose}
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
            <Close type="button" onClick={onClose} />
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
              onClick={onClose}
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
              isLoading={isDeleting}
              sx={{ minHeight: 39, minWidth: 78 }}
              onClick={() => {
                void onDelete();
              }}
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
