import { Box, Text } from "@prismicio/editor-ui";

export function Hint(args: { show: boolean }) {
  if (!args.show) return null;

  return (
    <Box
      padding={{ block: 8, inline: 16 }}
      border={{ top: true }}
      borderColor="grey6"
    >
      <Text variant="normal" color="grey11">
        No code snippet for this field.{" "}
        <a
          href="https://prismic.io/docs/fields/content-relationship"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "inherit",
            textDecoration: "underline",
          }}
        >
          Check the docs
        </a>{" "}
        for an example.
      </Text>
    </Box>
  );
}
