import {
  Box,
  Text,
  TreeView,
  TreeViewCheckbox,
  TreeViewSection,
} from "@prismicio/editor-ui";

export function ContentRelationshipFieldPicker() {
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
          subtitle="(3)"
          onChange={(selected) => {
            console.log(selected);
          }}
        >
          <TreeViewSection
            name="customTypeA"
            title="Custom Type A"
            subtitle="(3 fields exposed)"
            badge="Custom Type"
            defaultOpen
          >
            <TreeViewCheckbox name="name" title="Name" />
            <TreeViewCheckbox
              name="biography"
              title="Biography"
              defaultChecked
            />
            <TreeViewSection
              name="sliceA"
              title="Slice A"
              subtitle="(2 fields exposed)"
              badge="Slice"
              defaultOpen
            >
              <TreeViewCheckbox name="title" title="Title" defaultChecked />
              <TreeViewCheckbox name="subtitle" title="Subtitle" />
              <TreeViewCheckbox name="image" title="Image" defaultChecked />
            </TreeViewSection>
          </TreeViewSection>
          <TreeViewSection
            name="customTypeB"
            title="Custom Type B"
            badge="Custom Type"
          >
            Something else
          </TreeViewSection>
          <TreeViewSection
            name="customTypeC"
            title="Custom Type C"
            badge="Custom Type"
          >
            Something else
          </TreeViewSection>
          <TreeViewSection
            name="customTypeD"
            title="Custom Type D"
            badge="Custom Type"
          >
            Something else
          </TreeViewSection>
        </TreeView>
      </Box>
      <Box backgroundColor="white" flexDirection="column" padding={12}>
        <Text variant="normal" color="grey11">
          Have ideas for improving this field?{' '}
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
