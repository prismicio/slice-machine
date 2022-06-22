import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { Button, Spinner } from "theme-ui";
import { CustomTypeStatus } from "@src/modules/selectedCustomType/types";
import {
  selectCustomTypeStatus,
  selectIsCurrentCustomTypeHasPendingModifications,
} from "@src/modules/selectedCustomType";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";

interface PrimaryButtonProps {
  isSavingCustomType: boolean;
  isPushingCustomType: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  isSavingCustomType,
  isPushingCustomType,
}) => {
  const { hasPendingModifications, customTypeStatus } = useSelector(
    (store: SliceMachineStoreType) => ({
      hasPendingModifications:
        selectIsCurrentCustomTypeHasPendingModifications(store),
      customTypeStatus: selectCustomTypeStatus(store),
    })
  );
  const { saveCustomType, pushCustomType } = useSliceMachineActions();

  const buttonProps = (() => {
    if (hasPendingModifications) {
      return {
        onClick: () => {
          saveCustomType();
        },
        children: (
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
        ),
      };
    }
    if (
      [CustomTypeStatus.New, CustomTypeStatus.Modified].includes(
        customTypeStatus
      )
    ) {
      return {
        onClick: () => {
          if (!isPushingCustomType) {
            pushCustomType();
          }
        },
        children: (
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
        ),
      };
    }
    return { variant: "disabled", children: "Synced with Prismic" };
  })();

  return <Button {...buttonProps} />;
};
