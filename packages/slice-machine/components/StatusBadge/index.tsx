import ReactTooltip from "react-tooltip";
import { Badge, Box, Flex, Text } from "theme-ui";
import { ReactTooltipPortal } from "@components/ReactTooltipPortal";
import { ModelStatus } from "@lib/models/common/ModelStatus";
import { AuthStatus } from "@src/modules/userContext/types";

interface StatusBadgeProps {
  modelType: "Slice" | "Custom Type";
  modelId: string;
  status: ModelStatus;
  authStatus: AuthStatus;
  isOnline: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  modelType,
  modelId,
  status,
  authStatus,
  isOnline,
}) => {
  // Getting information to display depending on status
  const { displayName, tooltipText } = statusDisplayInformation(
    modelType,
    status,
    authStatus,
    isOnline
  );

  return (
    <Box sx={{ height: 28, display: "flex", alignItems: "center" }}>
      <Text
        data-for={`${modelId}-tooltip`}
        data-tip
        sx={{
          display: "flex",
          height: 24,
        }}
      >
        <Badge
          variant={status}
          sx={{
            padding: "4px 8px;",
            borderRadius: "6px;",
            lineHeight: "16px",
          }}
        >
          {displayName}
        </Badge>
      </Text>
      <ReactTooltipPortal>
        <ReactTooltip
          id={`${modelId}-tooltip`}
          type="dark"
          multiline
          border
          borderColor="black"
          place="bottom"
          effect="solid"
        >
          <Flex
            sx={{
              maxWidth: "196px",
              textAlign: "center",
              margin: "0 -13px",
            }}
          >
            {tooltipText}
          </Flex>
        </ReactTooltip>
      </ReactTooltipPortal>
    </Box>
  );
};

function statusDisplayInformation(
  modelType: StatusBadgeProps["modelType"],
  status: ModelStatus,
  authStatus: AuthStatus,
  isOnline: boolean
): { displayName: string; tooltipText: string } {
  switch (status) {
    case ModelStatus.New:
      return {
        displayName: "New",
        tooltipText: `This ${modelType} exists only locally. Upon sync, it will be pushed to your remote repository.`,
      };

    case ModelStatus.Modified:
      return {
        displayName: "Modified",
        tooltipText: `This ${modelType} has been modified locally. Upon sync, changes will be pushed to your remote repository.`,
      };

    case ModelStatus.Synced:
      return {
        displayName: "Synced",
        tooltipText: `This ${modelType} is in sync with the remote repository.`,
      };

    case ModelStatus.Deleted:
      return {
        displayName: "Deleted",
        tooltipText: `This ${modelType} has been deleted locally.`,
      };

    case ModelStatus.Unknown:
      if (!isOnline) {
        return {
          displayName: "Unknown",
          tooltipText:
            "Data from the remote repository could not be fetched (no internet connection).",
        };
      }

      if (authStatus === AuthStatus.UNAUTHORIZED) {
        return {
          displayName: "Unknown",
          tooltipText:
            "Data from the remote repository could not be fetched (not connected to Prismic).",
        };
      }

      if (authStatus === AuthStatus.FORBIDDEN) {
        return {
          displayName: "Unknown",
          tooltipText:
            "Data from the remote repository could not be fetched (you don't have access to the repository).",
        };
      }

    default:
      return {
        displayName: "Unknown",
        tooltipText:
          "Data from the remote repository could not be fetched (unknown error).",
      };
  }
}
