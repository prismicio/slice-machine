import { Text } from "theme-ui";

import Header from "@components/Header";

import useSliceMachineActions from "@src/modules/useSliceMachineActions";
import { MdSpaceDashboard } from "react-icons/md";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import { selectCurrentCustomType } from "@src/modules/selectedCustomType";

import { isSelectedCustomTypeTouched } from "@src/modules/selectedCustomType";

import { isLoading } from "@src/modules/loading";
import { LoadingKeysEnum } from "@src/modules/loading/types";
import { AiFillSave } from "react-icons/ai";
import { Button } from "@components/Button";

const CustomTypeHeader = () => {
  const { currentCustomType } = useSelector((store: SliceMachineStoreType) => ({
    currentCustomType: selectCurrentCustomType(store),
  }));
  const { hasPendingModifications, isSavingCustomType } = useSelector(
    (store: SliceMachineStoreType) => ({
      hasPendingModifications: isSelectedCustomTypeTouched(store),
      isSavingCustomType: isLoading(store, LoadingKeysEnum.SAVE_CUSTOM_TYPE),
    })
  );
  const { saveCustomType } = useSliceMachineActions();

  if (!currentCustomType) return null;

  return (
    <>
      <Header
        link={{
          Element: (
            <>
              <MdSpaceDashboard />
              <Text>Custom Types</Text>
            </>
          ),
          href: "/",
        }}
        subtitle={{
          Element: (
            <Text data-cy="custom-type-secondary-breadcrumb">
              / {currentCustomType.label}
            </Text>
          ),
          title: currentCustomType.label || "",
        }}
        Actions={[
          <Button
            label="Save to File System"
            isLoading={isSavingCustomType}
            disabled={!hasPendingModifications || isSavingCustomType}
            onClick={saveCustomType}
            Icon={AiFillSave}
            iconFill="#FFFFFF"
            data-cy="builder-save-button"
          />,
        ]}
      />
    </>
  );
};

export default CustomTypeHeader;
