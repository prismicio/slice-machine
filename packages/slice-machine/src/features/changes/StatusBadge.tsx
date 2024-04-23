import { Badge, Tooltip } from "@prismicio/editor-ui";
import type { ComponentPropsWithoutRef, FC } from "react";

import { ModelStatus } from "@/legacy/lib/models/common/ModelStatus";
import { AuthStatus } from "@/modules/userContext/types";

export type StatusBadgeProps = GetStatusBadgeContentArgs;

export const StatusBadge: FC<StatusBadgeProps> = (props) => {
  const { badgeColor, badgeTitle, tooltipContent } =
    getStatusBadgeContent(props);
  return (
    <Tooltip content={tooltipContent} side="bottom">
      <Badge color={badgeColor} title={badgeTitle} />
    </Tooltip>
  );
};

type GetStatusBadgeContentArgs = {
  authStatus: AuthStatus;
  isOnline: boolean;
  modelStatus: ModelStatus;
  modelType: ModelType;
};

type ModelType = "CustomType" | "Slice";

type StatusBadgeContent = {
  badgeColor: ComponentPropsWithoutRef<typeof Badge>["color"];
  badgeTitle: string;
  tooltipContent: string;
};

function getStatusBadgeContent(
  args: GetStatusBadgeContentArgs,
): StatusBadgeContent {
  const modelTypeLabel = modelTypeLabels[args.modelType];
  switch (args.modelStatus) {
    case ModelStatus.New: {
      return {
        badgeColor: "green",
        badgeTitle: "New",
        tooltipContent: `This ${modelTypeLabel} exists only locally. Upon sync, it will be pushed to your remote repository.`,
      };
    }
    case ModelStatus.Modified: {
      return {
        badgeColor: "amber",
        badgeTitle: "Modified",
        tooltipContent: `This ${modelTypeLabel} has been modified locally. Upon sync, changes will be pushed to your remote repository.`,
      };
    }
    case ModelStatus.Synced: {
      return {
        badgeColor: "purple",
        badgeTitle: "Synced",
        tooltipContent: `This ${modelTypeLabel} is in sync with the remote repository.`,
      };
    }
    case ModelStatus.Deleted: {
      return {
        badgeColor: "tomato",
        badgeTitle: "Deleted",
        tooltipContent: `This ${modelTypeLabel} has been deleted locally.`,
      };
    }
    case ModelStatus.Unknown: {
      if (!args.isOnline) {
        return {
          badgeColor: "grey",
          badgeTitle: "Unknown",
          tooltipContent:
            "Data from the remote repository could not be fetched (no internet connection).",
        };
      }
      if (args.authStatus === AuthStatus.UNAUTHORIZED) {
        return {
          badgeColor: "grey",
          badgeTitle: "Unknown",
          tooltipContent:
            "Data from the remote repository could not be fetched (not connected to Prismic).",
        };
      }
      if (args.authStatus === AuthStatus.FORBIDDEN) {
        return {
          badgeColor: "grey",
          badgeTitle: "Unknown",
          tooltipContent:
            "Data from the remote repository could not be fetched (you don't have access to the repository).",
        };
      }
    }
    default: {
      return {
        badgeColor: "grey",
        badgeTitle: "Unknown",
        tooltipContent:
          "Data from the remote repository could not be fetched (unknown error).",
      };
    }
  }
}

const modelTypeLabels: Record<ModelType, string> = {
  CustomType: "type",
  Slice: "slice",
};
