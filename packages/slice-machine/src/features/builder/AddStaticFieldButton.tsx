import { Box } from "@prismicio/editor-ui";
import { createContext, ReactNode, useContext, useState } from "react";

import {
  AddFieldDropdown,
  type AddFieldDropdownProps,
} from "@/features/builder/AddFieldDropdown";
import { StaticFieldsInfoDialog } from "@/features/builder/StaticFieldsInfoDialog";
import { usePersistedState } from "@/hooks/usePersistedState";

const LOCAL_STORAGE_KEY = "staticFieldsInfoDialogDismissed";

export function AddStaticFieldButton(props: AddFieldDropdownProps) {
  return (
    <StaticFieldsInfoProvider>
      <AddStaticFieldButtonComponent {...props} />
    </StaticFieldsInfoProvider>
  );
}

interface StaticFieldsInfoProviderProps {
  children: ReactNode;
}

function StaticFieldsInfoProvider(props: StaticFieldsInfoProviderProps) {
  const { children } = props;

  const [isInfoDialogSeen, setInfoDialogSeen] = usePersistedState<boolean>(
    LOCAL_STORAGE_KEY,
    false,
  );

  return (
    <StaticFieldsInfoContext.Provider
      value={{ isInfoDialogSeen, setInfoDialogSeen }}
    >
      {children}
    </StaticFieldsInfoContext.Provider>
  );
}

function AddStaticFieldButtonComponent(props: AddFieldDropdownProps) {
  const { disabled, fields, triggerDataTestId, onSelectField } = props;

  const { isInfoDialogSeen, setInfoDialogSeen } = useStaticFieldsInfoContext();
  const [isAddFieldDropdownOpen, setAddFieldDropdownOpen] = useState(false);

  return (
    <Box position="relative">
      <AddFieldDropdown
        open={isAddFieldDropdownOpen}
        onOpenChange={setAddFieldDropdownOpen}
        disabled={disabled}
        onSelectField={onSelectField}
        fields={fields}
        triggerDataTestId={triggerDataTestId}
        hideTriggerLabel={true}
      />
      {!isInfoDialogSeen && (
        <Box position="absolute" top={0} right={0}>
          <StaticFieldsInfoDialog
            onClose={() => {
              setInfoDialogSeen(true);
              setAddFieldDropdownOpen(true);
            }}
          />
        </Box>
      )}
    </Box>
  );
}

interface StaticFieldsInfoContext {
  isInfoDialogSeen: boolean;
  setInfoDialogSeen: (value: boolean) => void;
}

const StaticFieldsInfoContext = createContext<
  StaticFieldsInfoContext | undefined
>(undefined);

const useStaticFieldsInfoContext = () => {
  const context = useContext(StaticFieldsInfoContext);

  if (!context) {
    throw new Error(
      "useStaticFieldsInfoContext must be used within a StaticFieldsInfoProvider",
    );
  }

  return context;
};
