import { Box, Button, Text, Heading } from "theme-ui";

interface Props {
  title: string;
  explanations: string[];
  onCreateNew: () => void;
  buttonText: string;
  documentationComponent: React.ReactNode;
}

const EmptyState: React.FunctionComponent<Props> = ({
  title,
  explanations,
  onCreateNew,
  buttonText,
  documentationComponent,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
      textAlign: "center",
    }}
  >
    <Heading as={"h3"} sx={{ mb: 4 }}>
      {title}
    </Heading>
    {explanations.map((explanation) => (
      <Text variant={"xs"} sx={{ mb: 2, "&:last-of-type": { mb: 4 } }}>
        {explanation}
      </Text>
    ))}
    <Button
      onClick={onCreateNew}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mb: 5,
      }}
    >
      {buttonText}
    </Button>
    <Box
      sx={(theme) => ({
        backgroundColor: theme?.colors?.muted,
        p: 3,
        borderRadius: "8px",
      })}
    >
      <Text variant={"xs"}>{documentationComponent}</Text>
    </Box>
  </Box>
);

export default EmptyState;
