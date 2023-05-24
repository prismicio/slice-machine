import { FC, Suspense, useCallback, useEffect, useState } from "react";
import { updateData, useRequest } from "@prismicio/editor-support/Suspense";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Text,
  Icon,
  IconButton,
  Button,
  BlankSlate,
  BlankSlateImage,
  BlankSlateTitle,
  BlankSlateDescription,
  BlankSlateActions,
  Image,
  tokens,
  ErrorBoundary,
  Box,
  vars,
} from "@prismicio/editor-ui";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSelector } from "react-redux";

import { managerClient } from "@src/managerClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@src/components/Table";
import { ReusableIcon } from "@src/components/Icons/ReusableIcon";
import { UniqueIcon } from "@src/components/Icons/UniqueIcon";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { isLoading } from "@src/modules/loading";
import { SliceMachineStoreType } from "@src/redux/type";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { CreateCustomTypeModal } from "@components/Forms/CreateCustomTypeModal";
import { RenameCustomTypeModal } from "@components/Forms/RenameCustomTypeModal";
import { DeleteCustomTypeModal } from "@components/DeleteCTModal";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { Breadcrumb } from "@src/components/Breadcrumb/Breadcrumb";
import { selectAllCustomTypes } from "@src/modules/availableCustomTypes";
import { hasLocal } from "@lib/models/common/ModelData";
import { CustomTypes as ModelCustomTypes } from "@lib/models/common/CustomType";

const getCustomTypes = async (
  _format: Exclude<CustomType["format"], undefined>
) => {
  const { errors, models } =
    await managerClient.customTypes.readAllCustomTypes();

  if (errors.length > 0) {
    throw errors;
  }

  return models.map(({ model }) => model);
};

const useCustomTypes = (format: Exclude<CustomType["format"], undefined>) => {
  const update = useCallback(
    (data: CustomType[]) => updateData(getCustomTypes, [format], data),
    [format]
  );

  return {
    data: useRequest(getCustomTypes, [format]),
    update,
  };
};

type CustomTypesTableProps = Readonly<{
  format: Exclude<CustomType["format"], undefined>;
}>;

const CUSTOM_TYPES_PAGES_CONFIG = {
  custom: {
    label: "Custom Types",
    blankSlateImage: "/blank-slate-page-types.png",
    blankSlateDescription:
      "Page types are models that your editors will use to create website pages in the Page Builder.",
    errorDescription: "An error occurred while fetching your Custom Types.",
  },
  page: {
    label: "Page Types",
    blankSlateImage: "/blank-slate-page-types.png",
    blankSlateDescription:
      "Page types are models that your editors will use to create website pages in the Page Builder.",
    errorDescription: "An error occurred while fetching your Page Types.",
  },
};

const CustomTypesTable: FC<CustomTypesTableProps> = ({ format }) => {
  const [selectedCustomType, setSelectedCustomType] = useState<CustomType>();
  const {
    openCreateCustomTypeModal,
    openRenameCustomTypeModal,
    openDeleteCustomTypeModal,
  } = useSliceMachineActions();
  const router = useRouter();
  const { data: customTypes, update } = useCustomTypes(format);
  const sortedCustomTypes = customTypes.sort(
    (customType1: CustomType, customType2: CustomType) => {
      return customType1.id.localeCompare(customType2.id);
    }
  );
  const customTypesPageConfig = CUSTOM_TYPES_PAGES_CONFIG[format];

  // TODO: DT-1363 - Update the way to have new data without Redux by revalidating Suspense
  const { storeCustomTypes } = useSelector((store: SliceMachineStoreType) => ({
    storeCustomTypes: selectAllCustomTypes(store).filter(hasLocal),
  }));
  const sortedStoreCustomTypes = storeCustomTypes.sort(
    (customType1, customType2) => {
      return customType1.local.id.localeCompare(customType2.local.id);
    }
  );
  useEffect(() => {
    if (
      sortedStoreCustomTypes.length !== customTypes.length ||
      sortedStoreCustomTypes.some(
        (ct, index) => ct.local.label !== customTypes[index].label
      )
    ) {
      const newCustomTypes: CustomType[] = sortedStoreCustomTypes.map(
        ({ local }) => ModelCustomTypes.fromSM(local)
      );
      update(newCustomTypes);
    }
  }, [sortedStoreCustomTypes, customTypes, update]);

  if (sortedCustomTypes.length === 0) {
    return (
      <BlankSlate style={{ marginTop: tokens.size[72] }}>
        <BlankSlateImage>
          <Image src={customTypesPageConfig.blankSlateImage} sizing="contain" />
        </BlankSlateImage>
        <BlankSlateTitle size="big">
          {customTypesPageConfig.label}
        </BlankSlateTitle>
        <BlankSlateDescription>
          {customTypesPageConfig.blankSlateDescription}
        </BlankSlateDescription>
        <BlankSlateActions>
          <Button size="medium" onClick={openCreateCustomTypeModal}>
            Create
          </Button>
        </BlankSlateActions>
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
            const { id, label, repeatable } = customType;

            return (
              <TableRow
                key={id}
                onClick={() => {
                  void router.push(`/cts/${id}`);
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
                    <DropdownMenuTrigger>
                      <IconButton icon="moreVert" />
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
          <RenameCustomTypeModal customType={selectedCustomType} />
          <DeleteCustomTypeModal customType={selectedCustomType} />
        </>
      )}
    </>
  );
};

const CustomTypes: FC = () => {
  const format = "custom";
  const customTypesPageConfig = CUSTOM_TYPES_PAGES_CONFIG[format];
  const { openCreateCustomTypeModal } = useSliceMachineActions();
  const { isCreatingCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      isCreatingCustomType: isLoading(
        store,
        LoadingKeysEnum.CREATE_CUSTOM_TYPE
      ),
    })
  );

  return (
    <>
      <Head>
        <title>Custom Types - Slice Machine</title>
      </Head>
      <div
        style={{
          display: "flex",
          width: vars.size["100%"],
          flexDirection: "column",
          margin: `${vars.size[16]} 0`,
        }}
      >
        <ErrorBoundary
          title="Request failed"
          description={customTypesPageConfig.errorDescription}
          renderError={(error) => {
            return (
              <Box
                height={"100%"}
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                {error}
              </Box>
            );
          }}
        >
          <Suspense fallback="Loading...">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: vars.size[16],
                height: vars.size[32],
              }}
            >
              <Breadcrumb>{customTypesPageConfig.label}</Breadcrumb>
              <Button
                data-cy="create-ct"
                endIcon={<Icon name="add" />}
                loading={isCreatingCustomType}
                onClick={openCreateCustomTypeModal}
              >
                Create
              </Button>
            </div>

            <CustomTypesTable format={format} />
            <CreateCustomTypeModal format={format} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
};

export default CustomTypes;
