import ReactTooltip from "react-tooltip";
import { Badge, Flex, Text } from "theme-ui";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { CustomTypeStatus } from "../../src/modules/selectedCustomType/types";
import { useNetwork } from "@src/hooks/useNetwork";

const statusEnumToDisplayNameAndTooltip = (status?: string) => {
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
    case CustomTypeStatus.UnknownOffline:
      return {
        statusDisplayName: "Unknown",
        statusTooltip:
          "Data from the remote repository could not be fetched (no internet connection).",
      };
    case CustomTypeStatus.UnknownDisconnected:
      return {
        statusDisplayName: "Unknown",
        statusTooltip:
          "Data from the remote repository could not be fetched (not connected to Prismic).",
      };
    default:
      return {
        statusDisplayName: "Unknown",
        statusTooltip:
          "Data from the remote repository could not be fetched (unknown error).",
      };
  }
};

interface StatusBadgeWithTooltipProps {
  customType: CustomTypeSM;
}

export const StatusBadgeWithTooltip: React.FC<StatusBadgeWithTooltipProps> = ({
  customType,
}) => {
  const isOnline = useNetwork();

  const updatedCustomTypeStatus = !isOnline
    ? CustomTypeStatus.UnknownOffline
    : customType.__status;

  const updatedCustomType = {
    ...customType,
    __status: updatedCustomTypeStatus,
  };

  const { statusDisplayName, statusTooltip } =
    statusEnumToDisplayNameAndTooltip(updatedCustomType.__status);

  return (
    <>
      <Text data-for={`${updatedCustomType.id}-tooltip`} data-tip>
        <Badge mr="2" variant={updatedCustomType.__status}>
          {statusDisplayName}
        </Badge>
      </Text>
      <ReactTooltip
        id={`${updatedCustomType.id}-tooltip`}
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
          {statusTooltip}
        </Flex>
      </ReactTooltip>
    </>
  );
};
