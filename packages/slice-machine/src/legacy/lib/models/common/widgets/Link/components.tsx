import {
  Box,
  Button,
  Icon,
  IconButton,
  Switch,
  Text,
  TextInput,
  Tooltip,
} from "@prismicio/editor-ui";
import { useRef, useState } from "react";
import { Checkbox, Flex, Label } from "theme-ui";

import { Col } from "@/legacy/components/Flex";

interface CommonCheckboxProps {
  checked?: boolean;
  height?: 130 | 127;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFieldValue: (name: string, checked?: boolean) => void | Promise<any>;
}

export function DisplayTextCheckbox(props: CommonCheckboxProps) {
  const { checked, height = 130, setFieldValue } = props;

  // Container to position the tooltip inside it.
  const [container, setContainer] = useState<HTMLElement | null>(null);

  return (
    <Col>
      <Flex
        sx={{
          mt: 2,
          alignItems: "center",
          height: `${height}%`,
        }}
      >
        <Label variant="label.border">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            ref={setContainer}
          >
            <Flex>
              <Checkbox
                checked={checked}
                onChange={(event) => {
                  void setFieldValue("config.allowText", event.target.checked);
                }}
              />
              Allow display text
            </Flex>
            <Tooltip
              container={container}
              align="end"
              content="Allow editors to customize the link display text"
            >
              <Icon name="alert" size="medium" color="grey11" />
            </Tooltip>
          </Box>
        </Label>
      </Flex>
    </Col>
  );
}

export function RepeatableCheckbox(props: CommonCheckboxProps) {
  const { checked, setFieldValue } = props;

  return (
    <Box flexDirection="column">
      <Label htmlFor="repeat" variant="label.primary">
        Repeatable
      </Label>
      <Label variant="label.border" sx={{ display: "flex" }}>
        <Checkbox
          name="repeat"
          checked={checked}
          onChange={(event) => {
            void setFieldValue("config.repeat", event.target.checked);
          }}
        />
        Make this link repeatable (allows editors to create lists of links)
      </Label>
      <Box alignItems="center" gap={4}>
        <Icon name="alert" size="medium" color="grey11" />
        <Text variant="normal" color="grey11">
          Repeatable link fields are returned as an array of links by the API.{" "}
          <a
            href="https://prismic.io/docs/field"
            style={{ textDecoration: "none" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Text variant="normal" color="indigo11">
              See documentation.
            </Text>
          </a>
        </Text>
      </Box>
    </Box>
  );
}

export function Variants({
  variants,
  onVariantsChange,
  error,
}: {
  variants?: string[];
  onVariantsChange: (variants?: string[]) => void;
  error?: string;
}) {
  const enabled = Boolean(variants);

  const onCheckedChange = (checked: boolean) => {
    onVariantsChange(checked ? ["Primary", "Secondary"] : undefined);
  };

  const switchLabel = enabled ? "Enabled" : "Disabled";

  const optionsTitle = `Options (${variants?.length ?? 0})`;

  const deleteButtonShown = (variants?.length ?? 0) > 2;

  const focusableInputIndex = useRef<number>();

  return (
    <Box overflow="hidden" flexDirection="column" border borderRadius={6}>
      <Box
        border={{ bottom: true }}
        padding={12}
        flexDirection="column"
        gap={8}
      >
        <Text variant="h4" color="grey12">
          Variants
        </Text>
        <Text color="grey12">
          Add variants like "Primary" and "Secondary" to allow editors to choose
          the link's style by selecting one of them.
        </Text>
        <Box gap={8}>
          <Switch checked={enabled} onCheckedChange={onCheckedChange} />
          <Text color="grey11">{switchLabel}</Text>
        </Box>
      </Box>
      {enabled && (
        <Box
          border={{ bottom: true }}
          padding={12}
          flexDirection="column"
          gap={8}
        >
          <Text variant="h5" color="grey11">
            {optionsTitle}
            {Boolean(error) && (
              <Text variant="inherit" color="tomato9">{` ${error}`}</Text>
            )}
          </Text>
          {variants?.map((variant, position) => (
            <Box key={position} gap={4} alignItems="center">
              <Box
                flexGrow={1}
                backgroundColor="white"
                padding={{ inline: 12, block: 8 }}
                flexDirection="column"
                border
                borderRadius={4}
              >
                <TextInput
                  ref={(ref) => {
                    if (focusableInputIndex.current !== position) return;
                    focusableInputIndex.current = undefined;
                    ref?.focus();
                  }}
                  placeholder="Variant option (e.g. Primary)"
                  value={variant}
                  onValueChange={(newVariant) =>
                    onVariantsChange(
                      variants?.map((variant, index) =>
                        index === position ? newVariant : variant,
                      ),
                    )
                  }
                />
              </Box>
              {deleteButtonShown && (
                <IconButton
                  type="button"
                  icon="delete"
                  onClick={() =>
                    onVariantsChange(
                      variants?.filter((_, index) => index !== position),
                    )
                  }
                />
              )}
            </Box>
          ))}
          <Box>
            <Button
              invisible
              startIcon="add"
              onClick={() => {
                focusableInputIndex.current = variants?.length;
                onVariantsChange([...(variants ?? []), ""]);
              }}
            >
              Add option
            </Button>
          </Box>
        </Box>
      )}
      <Box backgroundColor="white" flexDirection="column" padding={12}>
        <Text variant="normal" color="grey11">
          Need additional properties similar to "Variants"?{" "}
          <a
            href="https://community.prismic.io/t/link-field-use-cases-share-your-requests-and-feedback/18146"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            Please provide your feedback here.
          </a>
        </Text>
      </Box>
    </Box>
  );
}
