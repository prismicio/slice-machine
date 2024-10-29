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
    <Box justifyContent="center" height={48}>
      {!isCollapsed && (
        <Box flexGrow={1} flexDirection="column" gap={2} maxWidth="100%">
          <Text noWrap component="h1" variant="h3">
            {repositoryName}
          </Text>

          <Text noWrap component="h2" variant="small" color="grey11">
            {repositoryDomain}
          </Text>
        </Box>
      )}
      <Tooltip content="Open Prismic repository" side="right">
        <IconButton
          data-testid="prismic-repository-link"
          icon="openInNew"
          onClick={() => {
            window.open(repositoryUrl, "_blank");
          }}
        />
      </Tooltip>
    </Box>
  );
}
