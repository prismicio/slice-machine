import { type FC } from "react";
import { Icon, Button, Image, tokens, Box, Text } from "@prismicio/editor-ui";
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
import { useExperimentVariant } from "@src/hooks/useExperimentVariant";

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
    },
  );
  const customTypesConfig = CUSTOM_TYPES_CONFIG[format];
  const customTypesMessages = CUSTOM_TYPES_MESSAGES[format];
  const testXavierExperiment = useExperimentVariant("test-xavier");
  console.log("testXavierExperiment", testXavierExperiment);
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
      <Box
        padding={16}
        borderRadius={6}
        border={{ bottom: true, left: true, right: true, top: true }}
        justifyContent="center"
        alignItems="center"
        width={400}
        gap={24}
        backgroundColor="grey1"
      >
        {testXavierExperiment === "on" ? (
          <>
            <Icon name="check" size="large" color="green11" />
            <Text>
              This experiment is only displayed because repository name contain
              "xru" on it!
            </Text>
          </>
        ) : (
          <>
            <Icon name="close" size="large" color="tomato11" />
            <Text>
              Not part of the experiment because repository name don't contain
              "xru" on it!
            </Text>
          </>
        )}
      </Box>
      <Box padding={{ top: 16 }} />

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
                    CUSTOM_TYPES_CONFIG[format].getBuilderPagePathname(id),
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
