import type { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { FormikErrors } from "formik";
import { useState } from "react";
import { Box } from "theme-ui";

import { updateCustomTypeRoute } from "@/features/customTypes/actions/updateCustomTypeRoute";
import { useAutoSync } from "@/features/sync/AutoSyncProvider";
import useSliceMachineActions from "@/modules/useSliceMachineActions";

import ModalFormCard from "../../ModalFormCard";
import { InputBox } from "../components/InputBox";

interface CustomTypeRouteModalProps {
  isChangesLocal: boolean;
  customType: CustomType;
  onClose: () => void;
  setLocalCustomType?: (args: { customType: CustomType }) => void;
}

export const CustomTypeRouteModal: React.FC<CustomTypeRouteModalProps> = ({
  isChangesLocal,
  customType,
  onClose,
  setLocalCustomType,
}) => {
  const customTypeName = customType?.label ?? "";
  const customTypeId = customType?.id ?? "";
  const { saveCustomTypeSuccess } = useSliceMachineActions();
  const { syncChanges } = useAutoSync();

  const [isUpdatingRoute, setIsUpdatingRoute] = useState(false);

  const handleOnSubmit = async (values: { route: string }) => {
    setIsUpdatingRoute(true);
    if (isChangesLocal && setLocalCustomType) {
      setLocalCustomType({
        customType: { ...customType, route: values.route },
      });
      await updateCustomTypeRoute({
        model: customType,
        newRoute: values.route,
        onSuccess: (savedCustomType) => {
          saveCustomTypeSuccess(savedCustomType);
        },
      });
    } else {
      await updateCustomTypeRoute({
        model: customType,
        newRoute: values.route,
        onSuccess: (savedCustomType) => {
          saveCustomTypeSuccess(savedCustomType);
          syncChanges();
        },
      });
    }
    setIsUpdatingRoute(false);
    onClose();
  };

  return (
    <ModalFormCard
      isOpen
      testId="rename-custom-type-modal"
      widthInPx="530px"
      formId={`rename-custom-type-modal-${customTypeId}`}
      buttonLabel="Rename"
      close={onClose}
      onSubmit={(values) => void handleOnSubmit(values)}
      initialValues={{
        route: customType.route ?? "",
      }}
      isLoading={isUpdatingRoute}
      content={{
        title: `Configure route for ${customTypeName}`,
      }}
      validate={({ route: newRoute }: { route: string }) => {
        const errors: FormikErrors<{
          route: string;
        }> = {};

        if (!newRoute || !newRoute.length) {
          errors.route = "Cannot be empty.";
        }

        return Object.keys(errors).length > 0 ? errors : undefined;
      }}
    >
      {({ errors }) => (
        <Box>
          <InputBox
            name="route"
            label="Route"
            placeholder="/test"
            error={errors.route}
            testId="custom-type-route-input"
          />
        </Box>
      )}
    </ModalFormCard>
  );
};
