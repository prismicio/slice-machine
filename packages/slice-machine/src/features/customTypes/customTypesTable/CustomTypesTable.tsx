import { type FC, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Text,
  Icon,
  IconButton,
  Button,
  Image,
  tokens,
} from "@prismicio/editor-ui";
import { useRouter } from "next/router";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@src/components/Table";
import { ReusableIcon } from "@src/icons/ReusableIcon";
import { UniqueIcon } from "@src/icons/UniqueIcon";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { RenameCustomTypeModal } from "@components/Forms/RenameCustomTypeModal";
import { DeleteCustomTypeModal } from "@components/DeleteCTModal";
import { type CustomType } from "@prismicio/types-internal/lib/customtypes";
import { type CustomTypeFormat } from "@slicemachine/manager";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import { CUSTOM_TYPES_CONFIG } from "../customTypesConfig";
import {
  useCustomTypes,
  useCustomTypesAutoRevalidation,
} from "./useCustomTypes";
import { convertCustomToPageType } from "./convertCustomToPageType";
import {
  BlankSlate,
  BlankSlateImage,
  BlankSlateTitle,
  BlankSlateDescription,
  BlankSlateActions,
  BlankSlateContent,
} from "@src/components/BlankSlate";

type CustomTypesTableProps = {
  format: CustomTypeFormat;
  isCreatingCustomType: boolean;
};

export const CustomTypesTable: FC<CustomTypesTableProps> = ({
  format,
  isCreatingCustomType,
}) => {
  const [selectedCustomType, setSelectedCustomType] = useState<CustomType>();
  const {
    openCreateCustomTypeModal,
    openRenameCustomTypeModal,
    openDeleteCustomTypeModal,
    saveCustomTypeSuccess,
  } = useSliceMachineActions();
  const router = useRouter();
  const { customTypes, updateCustomTypes } = useCustomTypes(format);
  const sortedCustomTypes = customTypes.sort(
    (customType1: CustomType, customType2: CustomType) => {
      return customType1.id.localeCompare(customType2.id);
    }
  );
  const customTypesConfig = CUSTOM_TYPES_CONFIG[format];
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];
  const [customTypeBeingConverted, setCustomTypeBeingConverted] = useState<
    string | undefined
  >();

  useCustomTypesAutoRevalidation(customTypes, format, updateCustomTypes);

  const convertCustomType = async (customType: CustomType) => {
    setCustomTypeBeingConverted(customType.id);
    await convertCustomToPageType(customType, saveCustomTypeSuccess);
    setCustomTypeBeingConverted(undefined);
  };

  if (sortedCustomTypes.length === 0) {
    return (
      <BlankSlate style={{ alignSelf: "center", marginTop: tokens.size[72] }}>
        <BlankSlateImage>
          <Image src={customTypesConfig.blankSlateImage} sizing="cover" />
        </BlankSlateImage>
        <BlankSlateContent>
          <BlankSlateTitle>
            {customTypesMessages.name({ start: true, plural: true })}
          </BlankSlateTitle>
          <BlankSlateDescription>
            {customTypesMessages.blankSlateDescription}
          </BlankSlateDescription>
          <BlankSlateActions>
            <Button
              onClick={openCreateCustomTypeModal}
              loading={isCreatingCustomType}
            >
              Create
            </Button>
          </BlankSlateActions>
        </BlankSlateContent>
      </BlankSlate>
    );
  }

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Icon name="notes" size="medium" />
            </TableCell>
            <TableCell>Label</TableCell>
            <TableCell>API ID</TableCell>
            <TableCell>Limit</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedCustomTypes.map((customType: CustomType) => {
            const { repeatable, label, id } = customType;
            const isCustomTypeBeingConverted =
              customTypeBeingConverted === customType.id;

            return (
              <TableRow
                key={id}
                onClick={() => {
                  void router.push(
                    CUSTOM_TYPES_CONFIG[format].getBuilderPagePathname(id)
                  );
                }}
              >
                <TableCell>
                  {repeatable ? <ReusableIcon /> : <UniqueIcon />}
                </TableCell>
                <TableCell>{label}</TableCell>
                <TableCell>{id}</TableCell>
                <TableCell>{repeatable ? "Reusable" : "Single"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger disabled={isCustomTypeBeingConverted}>
                      <IconButton
                        icon="moreVert"
                        loading={isCustomTypeBeingConverted}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        startIcon={<Icon name="edit" />}
                        onSelect={() => {
                          setSelectedCustomType(customType);
                          openRenameCustomTypeModal();
                        }}
                      >
                        <Text>Rename</Text>
                      </DropdownMenuItem>
                      {format === "custom" && (
                        <DropdownMenuItem
                          startIcon={<Icon name="driveFileMove" />}
                          onSelect={() => {
                            void convertCustomType(customType);
                          }}
                        >
                          <Text>Convert to page type</Text>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        startIcon={<Icon color="tomato11" name="delete" />}
                        onSelect={() => {
                          setSelectedCustomType(customType);
                          openDeleteCustomTypeModal();
                        }}
                      >
                        <Text color="tomato11">Remove</Text>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedCustomType && (
        <>
          <RenameCustomTypeModal
            customType={selectedCustomType}
            format={format}
          />
          <DeleteCustomTypeModal
            customType={selectedCustomType}
            format={format}
          />
        </>
      )}
    </>
  );
};
