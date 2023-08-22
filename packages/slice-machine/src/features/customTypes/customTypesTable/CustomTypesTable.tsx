import { type FC } from "react";
import { Icon, Button, Image, tokens } from "@prismicio/editor-ui";
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
import { type CustomType } from "@prismicio/types-internal/lib/customtypes";
import { type CustomTypeFormat } from "@slicemachine/manager";
import { CUSTOM_TYPES_MESSAGES } from "@src/features/customTypes/customTypesMessages";
import { CUSTOM_TYPES_CONFIG } from "../customTypesConfig";
import {
  useCustomTypes,
  useCustomTypesAutoRevalidation,
} from "./useCustomTypes";

import {
  BlankSlate,
  BlankSlateImage,
  BlankSlateTitle,
  BlankSlateDescription,
  BlankSlateActions,
  BlankSlateContent,
} from "@src/components/BlankSlate";
import { EditDropdown } from "../EditDropdown";

type CustomTypesTableProps = {
  format: CustomTypeFormat;
  isCreatingCustomType: boolean;
};

export const CustomTypesTable: FC<CustomTypesTableProps> = ({
  format,
  isCreatingCustomType,
}) => {
  const { openCreateCustomTypeModal } = useSliceMachineActions();
  const router = useRouter();
  const { customTypes, updateCustomTypes } = useCustomTypes(format);
  const sortedCustomTypes = customTypes.sort(
    (customType1: CustomType, customType2: CustomType) => {
      return customType1.id.localeCompare(customType2.id);
    }
  );
  const customTypesConfig = CUSTOM_TYPES_CONFIG[format];
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];

  useCustomTypesAutoRevalidation(customTypes, format, updateCustomTypes);

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
                  <EditDropdown
                    isChangesLocal={false}
                    format={format}
                    customType={customType}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};
