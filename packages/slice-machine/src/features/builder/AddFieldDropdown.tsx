import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  Icon,
  Image,
  Text,
  Tooltip,
} from "@prismicio/editor-ui";
import { FieldType } from "@prismicio/types-internal/lib/customtypes";
import { ReactNode } from "react";

import {
  Field,
  FieldVariant,
  groupField,
  nestableFields,
  UIDField,
} from "@/domain/fields";

export type AddFieldDropdownProps = {
  disabled?: boolean;
  onSelectField: (fieldType: FieldType | FieldVariant) => void;
  fields: Field[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} & (
  | { trigger: ReactNode; triggerDataTestId?: never }
  | { trigger?: never; triggerDataTestId: string }
);

export function AddFieldDropdown(props: AddFieldDropdownProps) {
  const {
    open,
    onOpenChange,
    disabled = false,
    onSelectField,
    fields,
    triggerDataTestId = "add-field",
    trigger,
  } = props;

  const singleFieldsToRender = fields.filter(
    (field) =>
      nestableFields.some(
        (nestableField) => nestableField.name === field.name,
      ) || field.name === UIDField.name,
  );
  const groupFieldToRender = fields.find(
    (field) => field.name === groupField.name,
  );

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger disabled={disabled}>
        {trigger ?? (
          <Button startIcon="add" color="grey" data-testid={triggerDataTestId}>
            Add a field
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" maxHeight={400} collisionPadding={8}>
        <DropdownMenuLabel>Single fields</DropdownMenuLabel>
        {singleFieldsToRender.map((field) => (
          <AddFieldDropdownItem
            key={field.name}
            field={field}
            onSelectField={onSelectField}
          />
        ))}

        {groupFieldToRender && (
          <>
            <DropdownMenuLabel>Set of fields</DropdownMenuLabel>
            {
              <AddFieldDropdownItem
                field={groupFieldToRender}
                onSelectField={onSelectField}
              />
            }
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AddFieldDropdownItemProps {
  onSelectField: AddFieldDropdownProps["onSelectField"];
  field: Field;
}

function AddFieldDropdownItem(props: AddFieldDropdownItemProps) {
  const { field, onSelectField } = props;
  const { type, variant, name, icon, description, thumbnail } = field;

  return (
    <DropdownMenuItem
      key={`${type}${variant ? `-${variant}` : ""}`}
      startIcon={<Icon name={icon} size="large" />}
      description={description}
      onSelect={() => onSelectField(variant ?? type)}
      renderTooltip={(trigger) => (
        <Tooltip
          visible
          variant="custom"
          content={
            <>
              <Image
                src={thumbnail}
                borderRadius={4}
                sx={{
                  height: 170,
                  width: 278,
                }}
                animateOnLoad={false}
              />
              <Text color="white">How it will look for content editors.</Text>
            </>
          }
          align="start"
          side="left"
          sideOffset={4}
          animation="none"
        >
          {trigger}
        </Tooltip>
      )}
    >
      {name}
    </DropdownMenuItem>
  );
}
