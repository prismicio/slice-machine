import ReactTooltip from "react-tooltip";
import { Badge, Flex, Text } from "theme-ui";
import { FrontEndCustomType } from "../../src/modules/availableCustomTypes/types";
import { CustomTypeStatus } from "../../src/modules/selectedCustomType/types";

const StatusEnumToDisplayNameAndTooltip = (status: CustomTypeStatus) => {
  switch (status) {
    case CustomTypeStatus.New:
      return {
        statusDisplayName: "New",
        statusTooltip:
          "This Custom Type exists only locally. Upon sync, it will be pushed to your remote repository.",
      };
    case CustomTypeStatus.Modified:
      return {
        statusDisplayName: "Modified",
        statusTooltip:
          "This Custom Type has been modified locally. Upon sync, changes will be pushed to your remote repository.",
      };
    case CustomTypeStatus.Synced:
      return {
        statusDisplayName: "Synced",
        statusTooltip:
          "This Custom Type is in sync with the remote repository.",
      };
    case CustomTypeStatus.Unknown:
      return {
        statusDisplayName: "Unknown",
        statusTooltip:
          "Data from the remote repository could not be fetched (unknown error).",
      };
  }
};

interface StatusBadgeWithTooltipProps {
  customType: FrontEndCustomType;
}

export const StatusBadgeWithTooltip: React.FC<StatusBadgeWithTooltipProps> = ({
  customType,
}) => {
  const { statusDisplayName, statusTooltip } =
    StatusEnumToDisplayNameAndTooltip(CustomTypeStatus.New);

  return (
    <>
      <Text data-for={`${customType.local.id}-tooltip`} data-tip>
        <Badge mr="2" variant={CustomTypeStatus.New}>
          {statusDisplayName}
        </Badge>
      </Text>

      <ReactTooltip
        id={`${customType.local.id}-tooltip`}
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
          }}
        >
          {statusTooltip}
        </Flex>
      </ReactTooltip>
    </>
  );
};
