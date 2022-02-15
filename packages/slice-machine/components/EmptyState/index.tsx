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
    <Heading as={"h3"} sx={{ mb: 2 }}>
      {title}
    </Heading>
    {explanations.map((explanation, i) => (
      <Text
        key={`expl-${i + 1}`}
        variant="xs"
        sx={{ mb: 2, "&:last-of-type": { mb: 4 } }}
      >
        {explanation}
      </Text>
    ))}
    <Button
      onClick={onCreateNew}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mb: 4,
      }}
    >
      {buttonText}
    </Button>
    <Box
      sx={(theme) => ({
        backgroundColor: theme?.colors?.muted,
        px: 3,
        py: 2,
        borderRadius: "8px",
      })}
    >
      <Text
        variant={"xs"}
        sx={(theme) => ({
          color: theme?.colors?.grey05,
        })}
      >
        {documentationComponent}
      </Text>
    </Box>
  </Box>
);

export default EmptyState;
