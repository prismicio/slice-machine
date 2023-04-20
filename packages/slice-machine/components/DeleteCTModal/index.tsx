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
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import {
  LocalAndRemoteCustomType,
  LocalOnlyCustomType,
} from "@lib/models/common/ModelData";

type DeleteCTModalProps = {
  customType?: LocalOnlyCustomType | LocalAndRemoteCustomType;
};

export const DeleteCustomTypeModal: React.FunctionComponent<
  DeleteCTModalProps
> = ({ customType }) => {
  const { isDeleteCustomTypeModalOpen, isDeletingCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      isDeleteCustomTypeModalOpen: isModalOpen(
        store,
        ModalKeysEnum.DELETE_CUSTOM_TYPE
      ),
      isDeletingCustomType: isLoading(
        store,
        LoadingKeysEnum.DELETE_CUSTOM_TYPE
      ),
    })
  );

  const { closeModals, deleteCustomType } = useSliceMachineActions();

  const { theme } = useThemeUI();

  return (
    <SliceMachineModal
      isOpen={isDeleteCustomTypeModalOpen}
      shouldCloseOnOverlayClick={true}
      style={{
        content: {
          maxWidth: 612,
          borderRadius: "0px",
        },
      }}
      onRequestClose={closeModals}
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
                Delete Custom Type
              </Heading>
            </Flex>
            <Close type="button" onClick={() => closeModals()} />
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
              onClick={() => closeModals()}
              sx={{
                mr: "10px",
                fontWeight: "bold",
                color: "grey12",
                borderRadius: 6,
              }}
            />
            {customType?.local && (
              <Button
                label="Delete"
                variant="danger"
                isLoading={isDeletingCustomType}
                onClick={() =>
                  deleteCustomType(
                    customType?.local.id,
                    customType?.local.label ?? ""
                  )
                }
                sx={{ minHeight: 39, minWidth: 78 }}
              />
            )}
          </Flex>
        )}
      >
        <Paragraph>
          This action will immediately make the following change:
          <ul>
            <li>
              Delete the{" "}
              <Text sx={{ fontWeight: "bold" }}>
                customtypes/{customType?.local.id}/
              </Text>{" "}
              directory.
            </li>
          </ul>
          The next time you push your changes to Prismic, the following change
          will happen:
          <ul>
            <li>
              Remove the Custom Type and any associated Documents from your
              repository.
            </li>
          </ul>
        </Paragraph>
      </Card>
    </SliceMachineModal>
  );
};
