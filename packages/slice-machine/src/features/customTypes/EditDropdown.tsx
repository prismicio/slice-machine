import { type FC, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  IconButton,
} from "@prismicio/editor-ui";
import { useRouter } from "next/router";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";

import { type CustomType } from "@prismicio/types-internal/lib/customtypes";

import { convertCustomToPageType } from "./actions/convertCustomToPageType";

import { CUSTOM_TYPES_CONFIG } from "./customTypesConfig";

import { RenameCustomTypeModal } from "@components/Forms/RenameCustomTypeModal";
import { DeleteCustomTypeModal } from "@components/DeleteCTModal";
import { CustomTypeFormat } from "@slicemachine/manager";

type EditDropdownProps = {
  isChangesLocal: boolean;
  format: CustomTypeFormat;
  customType: CustomType;
  setLocalCustomType?: (customType: CustomType) => void;
};

export const EditDropdown: FC<EditDropdownProps> = ({
  format,
  customType,
  isChangesLocal,
  setLocalCustomType,
}) => {
  const router = useRouter();
  const { saveCustomTypeSuccess } = useSliceMachineActions();

  const [isDeleteCustomTypeModalOpen, setIsDeleteCustomTypeModalOpen] =
    useState(false);
  const [isRenameCustomTypeModalOpen, setIsRenameCustomTypeModalOpen] =
    useState(false);
  const [isCustomTypeBeingConverted, setCustomTypeBeingConverted] =
    useState(false);

  const convertCustomType = async () => {
    setCustomTypeBeingConverted(true);
    await convertCustomToPageType(customType, saveCustomTypeSuccess);
    const customPagePathname =
      CUSTOM_TYPES_CONFIG.custom.getBuilderPagePathname(customType.id);
    if (router.asPath === customPagePathname) {
      const pagePagePathname = CUSTOM_TYPES_CONFIG.page.getBuilderPagePathname(
        customType.id,
      );
      void router.replace(pagePagePathname);
      setCustomTypeBeingConverted(false);
    } else {
      setCustomTypeBeingConverted(false);
    }
  };

  const onDeleteCustomType = () => {
    const { tablePagePathname } =
      CUSTOM_TYPES_CONFIG[customType.format ?? "custom"];
    if (router.asPath !== tablePagePathname) {
      void router.replace(tablePagePathname);
    } else {
      setIsDeleteCustomTypeModalOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu modal>
        <DropdownMenuTrigger disabled={isCustomTypeBeingConverted}>
          <IconButton
            color="grey"
            data-testid="editDropdown"
            hiddenLabel="Custom type actions"
            icon="moreVert"
            loading={isCustomTypeBeingConverted}
            variant="solid"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            startIcon={<Icon name="edit" />}
            onSelect={() => {
              setIsRenameCustomTypeModalOpen(true);
            }}
          >
            Rename
          </DropdownMenuItem>
          {format === "custom" && !isChangesLocal && (
            <DropdownMenuItem
              startIcon={<Icon name="driveFileMove" />}
              onSelect={() => void convertCustomType()}
            >
              Convert to page type
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            color="tomato"
            startIcon={<Icon name="delete" />}
            onSelect={() => {
              setIsDeleteCustomTypeModalOpen(true);
            }}
          >
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isDeleteCustomTypeModalOpen ? (
        <DeleteCustomTypeModal
          format={format}
          customType={customType}
          onClose={() => setIsDeleteCustomTypeModalOpen(false)}
          onDeleteCustomTypeSuccess={onDeleteCustomType}
        />
      ) : null}
      {isRenameCustomTypeModalOpen ? (
        <RenameCustomTypeModal
          format={format}
          customType={customType}
          isChangesLocal={isChangesLocal}
          onClose={() => setIsRenameCustomTypeModalOpen(false)}
          setLocalCustomType={setLocalCustomType}
        />
      ) : null}
    </>
  );
};
