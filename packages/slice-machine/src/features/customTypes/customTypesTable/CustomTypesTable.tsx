import {
  Button,
  Icon,
  Image,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Text,
  theme,
} from "@prismicio/editor-ui";
import { type CustomType } from "@prismicio/types-internal/lib/customtypes";
import { type CustomTypeFormat } from "@slicemachine/manager";
import { useRouter } from "next/router";
import { type FC } from "react";

import {
  BlankSlate,
  BlankSlateActions,
  BlankSlateContent,
  BlankSlateDescription,
  BlankSlateImage,
  BlankSlateTitle,
} from "@/components/BlankSlate";
import { CUSTOM_TYPES_MESSAGES } from "@/features/customTypes/customTypesMessages";
import { ReusableIcon } from "@/icons/ReusableIcon";
import { SingleIcon } from "@/icons/SingleIcon";

import { CUSTOM_TYPES_CONFIG } from "../customTypesConfig";
import { EditDropdown } from "../EditDropdown";
import {
  useCustomTypes,
  useCustomTypesAutoRevalidation,
} from "./useCustomTypes";

type CustomTypesTableProps = {
  format: CustomTypeFormat;
  isCreatingCustomType: boolean;
  openCreateCustomTypeModal: () => void;
};

export const CustomTypesTable: FC<CustomTypesTableProps> = ({
  format,
  isCreatingCustomType,
  openCreateCustomTypeModal,
}) => {
  const router = useRouter();
  const { customTypes, updateCustomTypes } = useCustomTypes(format);
  const sortedCustomTypes = customTypes.sort(
    (customType1: CustomType, customType2: CustomType) => {
      return customType1.id.localeCompare(customType2.id);
    },
  );
  const customTypesConfig = CUSTOM_TYPES_CONFIG[format];
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];

  useCustomTypesAutoRevalidation(customTypes, format, updateCustomTypes);

  if (sortedCustomTypes.length === 0) {
    return (
      <BlankSlate
        data-testid="blank-slate"
        style={{ alignSelf: "center", marginTop: theme.space[72] }}
      >
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

  // The wrapping `<div>` prevents `<Table>` from growing vertically.
  return (
    <div>
      <Table columnLayout="28px 1fr 1fr 1fr 42px">
        <TableHead>
          <TableRow>
            <TableCell>
              <Icon name="notes" size="medium" />
            </TableCell>
            <TableCell>
              <Text color="grey11" variant="small">
                Label
              </Text>
            </TableCell>
            <TableCell>
              <Text color="grey11" variant="small">
                API ID
              </Text>
            </TableCell>
            <TableCell>
              <Text color="grey11" variant="small">
                Limit
              </Text>
            </TableCell>
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
                    CUSTOM_TYPES_CONFIG[format].getBuilderPagePathname(id),
                  );
                }}
              >
                <TableCell>
                  {repeatable ? (
                    <ReusableIcon width={theme.space[20]} />
                  ) : (
                    <SingleIcon width={theme.space[20]} />
                  )}
                </TableCell>
                <TableCell>
                  <Text variant="bold" noWrap={true}>
                    {label}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text color="grey11" noWrap={true}>
                    {id}
                  </Text>
                </TableCell>
                <TableCell>
                  <Text color="grey11" noWrap={true}>
                    {repeatable ? "Reusable" : "Single"}
                  </Text>
                </TableCell>
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
    </div>
  );
};
