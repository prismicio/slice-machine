import { type FC, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Text,
  Icon,
  Button,
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
  isChangesLocal?: boolean;
  format: CustomTypeFormat;
  customType: CustomType;
};

export const EditDropdown: FC<EditDropdownProps> = ({
  format,
  customType,
  isChangesLocal,
}) => {
  const router = useRouter();
  const { saveCustomTypeSuccess } = useSliceMachineActions();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isCustomTypeBeingConverted, setCustomTypeBeingConverted] =
    useState(false);

  const convertCustomType = async () => {
    setCustomTypeBeingConverted(true);
    await convertCustomToPageType(customType, saveCustomTypeSuccess);
    const customPagePathname =
      CUSTOM_TYPES_CONFIG.custom.getBuilderPagePathname(customType.id);
    if (router.asPath === customPagePathname) {
      const pagePagePathname = CUSTOM_TYPES_CONFIG.page.getBuilderPagePathname(
        customType.id
      );
      void router.replace(pagePagePathname);
      setTimeout(() => {
        setCustomTypeBeingConverted(false);
      }, 1400);
    } else {
      setCustomTypeBeingConverted(false);
    }
  };

  const onCloseDeleteModal = (didDelete: boolean | undefined) => {
    if (didDelete === true) {
      const { tablePagePathname } =
        CUSTOM_TYPES_CONFIG[customType.format ?? "custom"];
      if (router.asPath !== tablePagePathname) {
        void router.replace(tablePagePathname);
        setTimeout(() => {
          setIsDeleting(false);
        }, 1400);
      } else {
        setIsDeleting(false);
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger disabled={isCustomTypeBeingConverted}>
          <Button
            loading={isCustomTypeBeingConverted}
            startIcon={<Icon name="moreVert" />}
            variant="secondary"
            data-testid="editDropdown"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            startIcon={<Icon name="edit" />}
            onSelect={() => {
              setIsRenaming(true);
            }}
          >
            <Text>Rename</Text>
          </DropdownMenuItem>
          {format === "custom" && (
            <DropdownMenuItem
              startIcon={<Icon name="driveFileMove" />}
              onSelect={() => void convertCustomType()}
            >
              <Text>Convert to page type</Text>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            startIcon={<Icon color="tomato11" name="delete" />}
            onSelect={() => {
              setIsDeleting(true);
            }}
          >
            <Text color="tomato11">Remove</Text>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isDeleting ? (
        <DeleteCustomTypeModal
          customType={customType}
          format={format}
          onClose={onCloseDeleteModal}
        />
      ) : null}
      {isRenaming ? (
        <RenameCustomTypeModal
          format={format}
          customType={customType}
          isChangesLocal={isChangesLocal}
          onClose={() => setIsRenaming(false)}
        />
      ) : null}
    </>
  );
};
