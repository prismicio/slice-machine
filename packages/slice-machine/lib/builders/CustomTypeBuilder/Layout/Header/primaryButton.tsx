import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { Button, Spinner } from "theme-ui";
import { CustomTypeStatus } from "@src/modules/selectedCustomType/types";
import { selectIsCurrentCustomTypeHasPendingModifications } from "@src/modules/selectedCustomType";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

interface PrimaryButtonProps {
  isSavingCustomType: boolean;
  isPushingCustomType: boolean;
  customTypeStatus: CustomTypeStatus;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  isSavingCustomType,
  isPushingCustomType,
  customTypeStatus,
}) => {
  const { hasPendingModifications } = useSelector(
    (store: SliceMachineStoreType) => ({
      hasPendingModifications:
        selectIsCurrentCustomTypeHasPendingModifications(store),
    })
  );
  const { saveCustomType, pushCustomType } = useSliceMachineActions();

  if (hasPendingModifications) {
    return (
      <Button
        onClick={() => {
          saveCustomType();
        }}
        children={
          <span>
            {isSavingCustomType ? (
              <Spinner
                color="#F7F7F7"
                size={20}
                mr={2}
                sx={{ position: "relative", top: "5px", left: "3px" }}
              />
            ) : null}
            Save to File System
          </span>
        }
      />
    );
  }

  if (
    [
      CustomTypeStatus.New,
      CustomTypeStatus.Modified,
      CustomTypeStatus.UnknownDefault,
      CustomTypeStatus.UnknownOffline,
      CustomTypeStatus.UnknownDisconnected,
    ].includes(customTypeStatus)
  ) {
    return (
      <Button
        onClick={() => {
          if (!isPushingCustomType) {
            pushCustomType();
          }
        }}
        children={
          <span>
            {isPushingCustomType ? (
              <Spinner
                color="#F7F7F7"
                size={20}
                mr={2}
                sx={{ position: "relative", top: "5px", left: "3px" }}
              />
            ) : null}
            Push to Prismic
          </span>
        }
      />
    );
  }

  return <Button variant={"disabled"} children={"Synced with Prismic"} />;
};
