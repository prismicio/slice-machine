import { useCallback, useState, useEffect } from "react";
import { uniqueId } from "lodash";
import { toast } from "react-toastify";
import { Box, Button, Text } from "@prismicio/editor-ui";

type UseAutoSaveArgs = {
  debounceDelay?: number;
  errorMessage?: string;
  retryDelay?: number;
  retryMessage?: string;
};

type AutoSaveState = {
  pendingSave: (() => Promise<unknown>) | null;
  nextSave: (() => Promise<unknown>) | null;
};

export type AutoSaveStatusType = "saving" | "saved" | "error";

export const useAutoSave = (args: UseAutoSaveArgs = {}) => {
  const {
    debounceDelay = 500,
    errorMessage = "An error happened while saving",
    retryDelay = 2000,
    retryMessage = "Retry",
  } = args;
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    pendingSave: null,
    nextSave: null,
  });
  const [autoSaveStatusInternal, setAutoSaveStatusInternal] =
    useState<AutoSaveStatusType>("saved");
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatusType>(
    autoSaveStatusInternal,
  );

  const setNextSave = useCallback((saveAction: () => Promise<unknown>) => {
    setAutoSaveState((prevState) => ({
      ...prevState,
      nextSave: saveAction,
    }));
  }, []);

  const executeSave = useCallback(async () => {
    if (autoSaveState.pendingSave) {
      setAutoSaveStatusInternal("saving");

      try {
        await autoSaveState.pendingSave();

        setAutoSaveStatusInternal("saved");
        setAutoSaveState((prevState) => ({
          pendingSave: prevState.nextSave,
          nextSave: null,
        }));
      } catch (error) {
        setAutoSaveStatusInternal("error");
        console.error(errorMessage, error);

        const toastId = uniqueId();
        toast.error(
          <Box gap={8} alignItems="center">
            <Text>{errorMessage}</Text>
            <Button
              onClick={() => {
                toast.dismiss(toastId);
                setAutoSaveStatusInternal("saving");
                setTimeout(() => {
                  void executeSave();
                }, retryDelay);
              }}
            >
              {retryMessage}
            </Button>
          </Box>,
          {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            toastId,
          },
        );
      }
    }
  }, [autoSaveState, errorMessage, retryDelay, retryMessage]);

  useEffect(() => {
    if (
      autoSaveStatusInternal !== "saving" &&
      (autoSaveState.pendingSave || autoSaveState.nextSave)
    ) {
      setAutoSaveState((prevState) => ({
        pendingSave: prevState.nextSave,
        nextSave: null,
      }));

      executeSave().catch((error) =>
        console.error("Error in save effect:", error),
      );
    }
  }, [autoSaveStatusInternal, autoSaveState, executeSave]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      setAutoSaveStatus(autoSaveStatusInternal);
    }, debounceDelay);

    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [autoSaveStatusInternal, debounceDelay]);

  return { autoSaveStatus, setNextSave };
};
