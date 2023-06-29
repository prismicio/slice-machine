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
import { CustomTypeFormat } from "@slicemachine/manager/*";

type EditDropdownProps = {
  format: CustomTypeFormat;
  customType: CustomType;
};

export const EditDropdown: FC<EditDropdownProps> = ({ format, customType }) => {
  const router = useRouter();
  const { saveCustomTypeSuccess } = useSliceMachineActions();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isCustomTypeBeingConverted, setCustomTypeBeingConverted] =
    useState(false);

  const convertCustomType = async () => {
    setCustomTypeBeingConverted(true);
    await convertCustomToPageType(customType, saveCustomTypeSuccess);
    setCustomTypeBeingConverted(false);
    const url = CUSTOM_TYPES_CONFIG.page.getBuilderPagePathname(customType.id);
    void router.replace(url);
  };

  const onCloseDeleteModal = (didDelete: boolean | undefined) => {
    if (didDelete !== undefined && didDelete) {
      if (customType.format !== undefined) {
        const url = CUSTOM_TYPES_CONFIG[customType.format].tablePagePathname;
        void router.replace(url);
        setTimeout(() => {
          setIsDeleting(false);
        }, 800);
      } // else fallbacks to default NOT_FOUND behaviour
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
          customType={customType}
          format={format}
          onClose={() => setIsRenaming(false)}
        />
      ) : null}
    </>
  );
};
