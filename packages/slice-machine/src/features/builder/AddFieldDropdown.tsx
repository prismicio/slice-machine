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

import {
  Field,
  FieldVariants,
  groupField,
  groupFieldTemplates,
  nestableFields,
  UIDField,
} from "@/domain/fields";

interface AddFieldDropdownProps {
  disabled: boolean;
  onSelectField: (fieldType: FieldType | FieldVariants) => void;
  fields: Field[];
  triggerDataTestId?: string;
}

export function AddFieldDropdown(props: AddFieldDropdownProps) {
  const {
    disabled,
    onSelectField,
    fields,
    triggerDataTestId = "add-field",
  } = props;

  const renderDropdownItem = (field: Field, isTemplate = false) => {
    const { description, icon, name, type, variant } = field;

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
                  src="https://i.ibb.co/7SdbTsR/Screenshot-2024-07-12-at-19-35-34.png"
                  sx={{
                    height: 170,
                    width: 278,
                    borderRadius: 4,
                  }}
                />
                <Text color="white">How it will look for content editors.</Text>
              </>
            }
            side="left"
            sideOffset={4}
          >
            {trigger}
          </Tooltip>
        )}
      >
        {name}
        {isTemplate && (
          <>
            <Text variant="smallBold">&nbsp;⋅&nbsp;</Text>
            <Text color="purple9" variant="smallBold">
              Template
            </Text>
          </>
        )}
      </DropdownMenuItem>
    );
  };

  const singleFieldsToRender = fields.filter(
    (field) =>
      nestableFields.some(
        (nestableField) => nestableField.name === field.name,
      ) || field.name === UIDField.name,
  );
  const groupFieldToRender = fields.find(
    (field) => field.name === groupField.name,
  );
  const groupFieldTemplatesToRender = fields.filter((field) =>
    groupFieldTemplates.some((template) => template.name === field.name),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={disabled}>
        <Button startIcon="add" color="grey" data-testid={triggerDataTestId}>
          Add a field
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" maxHeight={400} collisionPadding={8}>
        <DropdownMenuLabel>Single fields</DropdownMenuLabel>
        {singleFieldsToRender.map((field) => renderDropdownItem(field))}

        {(groupFieldToRender || groupFieldTemplatesToRender.length > 0) && (
          <>
            <DropdownMenuLabel>Sets of fields</DropdownMenuLabel>
            {groupFieldToRender && renderDropdownItem(groupFieldToRender)}
            {groupFieldTemplatesToRender.map((groupFieldTemplate) =>
              renderDropdownItem(groupFieldTemplate, true),
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
