import SliceMachineModal from "@components/SliceMachineModal";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { Close, Flex, Heading, Text, useThemeUI } from "theme-ui";
import Card from "@components/Card";
import { MdOutlineDelete } from "react-icons/md";
import { Button } from "@components/Button";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { CustomTypeFormat } from "@slicemachine/manager";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";

type DeleteCTModalProps = {
  customType?: CustomType;
  format: CustomTypeFormat;
  onClose: () => void;
};

export const DeleteCustomTypeModal: React.FunctionComponent<
  DeleteCTModalProps
> = ({ customType, format, onClose }) => {
  const { isDeletingCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      isDeletingCustomType: isLoading(
        store,
        LoadingKeysEnum.DELETE_CUSTOM_TYPE
      ),
    })
  );
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];
  const { deleteCustomType } = useSliceMachineActions();

  const { theme } = useThemeUI();

  return (
    <SliceMachineModal
      isOpen
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
                Delete{" "}
                {customTypesMessages.name({ start: false, plural: false })}
              </Heading>
            </Flex>
            <Close type="button" onClick={() => onClose()} />
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
              onClick={() => onClose()}
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
        <div>
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
              Remove the{" "}
              {customTypesMessages.name({ start: false, plural: false })} and
              any associated Documents from your repository.
            </li>
          </ul>
        </div>
      </Card>
    </SliceMachineModal>
  );
};
