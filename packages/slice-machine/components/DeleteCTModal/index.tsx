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
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeFormat } from "@slicemachine/manager/*";
import { CUSTOM_TYPES_CONFIG } from "@src/features/customTypes/customTypesConfig";

type DeleteCTModalProps = {
  customType?: CustomType;
  format: CustomTypeFormat;
};

export const DeleteCustomTypeModal: React.FunctionComponent<
  DeleteCTModalProps
> = ({ customType, format }) => {
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
  const customTypesConfig = CUSTOM_TYPES_CONFIG[format];
  const { closeModals, deleteCustomType } = useSliceMachineActions();

  const { theme } = useThemeUI();

  return (
    <SliceMachineModal
      isOpen={isDeleteCustomTypeModalOpen}
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
        sx={{ border: "none", overflow: "hidden" }}
        borderFooter
        Header={() => (
          <Flex
            sx={{
              position: "sticky",
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
                Delete {customTypesConfig.name}
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
            {customType && (
              <Button
                label="Delete"
                variant="danger"
                isLoading={isDeletingCustomType}
                onClick={() =>
                  deleteCustomType(
                    customType.id,
                    format,
                    customType.label ?? ""
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
                customtypes/{customType?.id}/
              </Text>{" "}
              directory.
            </li>
          </ul>
          The next time you push your changes to Prismic, the following change
          will happen:
          <ul>
            <li>
              Remove the {customTypesConfig.name} and any associated Documents
              from your repository.
            </li>
          </ul>
        </Paragraph>
      </Card>
    </SliceMachineModal>
  );
};
