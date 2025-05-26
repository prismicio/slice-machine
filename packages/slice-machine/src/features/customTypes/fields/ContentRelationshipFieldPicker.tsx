import {
  Box,
  Text,
  TreeView,
  TreeViewCheckbox,
  TreeViewSection,
} from "@prismicio/editor-ui";
import { useSelector } from "react-redux";

import {
  hasLocal,
  LocalOrRemoteCustomType,
} from "@/legacy/lib/models/common/ModelData";
import { selectAllCustomTypes } from "@/modules/availableCustomTypes";

export function ContentRelationshipFieldPicker() {
  const customTypes = useSelector(selectAllCustomTypes).filter(hasLocal);
  const simplifiedCustomTypes = simplifyCustomTypes(customTypes);

  return (
    <Box overflow="hidden" flexDirection="column" border borderRadius={6}>
      <Box
        border={{ bottom: true }}
        padding={{ block: 16, inline: 16, top: 12 }}
        flexDirection="column"
        gap={8}
      >
        <Box flexDirection="column">
          <Text variant="h4" color="grey12">
            Types
          </Text>
          <Text color="grey12">
            Choose which fields you want to expose from the linked document.
          </Text>
        </Box>
        <TreeView
          title="Exposed fields"
          subtitle={`(${getTotalExposedFields(simplifiedCustomTypes)})`}
        >
          {simplifiedCustomTypes.map((ct) => (
            <TreeViewSection
              key={ct.id}
              title={ct.label}
              subtitle={`(${ct.fields.length} fields exposed)`}
              badge="Custom Type"
            >
              {ct.fields.map((field) => {
                return <TreeViewCheckbox key={field.id} title={field.label} />;
              })}
            </TreeViewSection>
          ))}
        </TreeView>
      </Box>
      <Box backgroundColor="white" flexDirection="column" padding={12}>
        <Text variant="normal" color="grey11">
          Have ideas for improving this field?{" "}
          <a
            href="https://community.prismic.io/t//TODO"
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

type SimplifiedCustomType = {
  id: string;
  label: string;
  fields: { id: string; label: string }[];
};

function simplifyCustomTypes(customTypes: LocalOrRemoteCustomType[]) {
  return customTypes.flatMap<SimplifiedCustomType>((ct) => {
    if (!("local" in ct)) return [];

    const { id, label, tabs } = ct.local;
    const fields = tabs.flatMap((tab) => {
      return tab.value.map((field) => ({
        id: field.key,
        label: field.value.config?.label ?? field.key,
      }));
    });

    return { id, label: label ?? id, fields };
  });
}

function getTotalExposedFields(customTypes: SimplifiedCustomType[]) {
  return customTypes.reduce((acc, ct) => acc + ct.fields.length, 0);
}
