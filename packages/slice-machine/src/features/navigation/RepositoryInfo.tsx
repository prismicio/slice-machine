import {
  Box,
  IconButton,
  Text,
  Tooltip,
  useMediaQuery,
} from "@prismicio/editor-ui";

import { useRepositoryInformation } from "@/hooks/useRepositoryInformation";

export function RepositoryInfo() {
  const { repositoryName, repositoryDomain, repositoryUrl } =
    useRepositoryInformation();
  const isCollapsed = useMediaQuery({ max: "medium" });

  return (
    <Box flexDirection="column" gap={2}>
      <Box
        justifyContent={isCollapsed ? "center" : "space-between"}
        alignItems="center"
        gap={2}
      >
        {!isCollapsed && (
          <Text noWrap variant="h3">
            {repositoryName}
          </Text>
        )}
        <Tooltip content="Open Prismic repository" side="right">
          <IconButton
            data-testid="prismic-repository-link"
            sx={{ flexShrink: 0 }}
            icon="openInNew"
            onClick={() => {
              window.open(repositoryUrl, "_blank");
            }}
          />
        </Tooltip>
      </Box>
      {!isCollapsed && (
        <Text noWrap variant="small" color="grey11">
          {repositoryDomain}
        </Text>
      )}
    </Box>
  );
}
