import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { Button, Spinner } from "theme-ui";
import { selectIsCurrentCustomTypeHasPendingModifications } from "@src/modules/selectedCustomType";
import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";

export const SaveButton: React.FC = () => {
  const { hasPendingModifications, isSavingCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      hasPendingModifications:
        selectIsCurrentCustomTypeHasPendingModifications(store),
      isSavingCustomType: isLoading(store, LoadingKeysEnum.SAVE_CUSTOM_TYPE),
    })
  );
  const { saveCustomType } = useSliceMachineActions();

  if (hasPendingModifications) {
    return (
      <Button
        onClick={() => {
          !isSavingCustomType && saveCustomType();
        }}
        data-cy="ct-builder-primary-button"
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

  return (
    <Button variant={"disabled"} children={"Synced with your File System"} />
  );
};
