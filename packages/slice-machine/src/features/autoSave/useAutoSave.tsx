import {
  useCallback,
  useState,
  useEffect,
  SetStateAction,
  Dispatch,
  useMemo,
} from "react";
import { uniqueId } from "lodash";
import { toast } from "react-toastify";
import { Box, Button, Text } from "@prismicio/editor-ui";

export type AutoSaveStatus = "saving" | "saved" | "failed";

type UseAutoSaveArgs = {
  autoSaveStatusDelay?: number;
  errorMessage?: string;
  retryDelay?: number;
  retryMessage?: string;
};

type UseAutoSaveReturnType = {
  autoSaveStatus: AutoSaveStatus;
  setNextSave: (nextSave: NextSave) => void;
};

type AutoSaveStack = {
  pendingSave: NextSave | undefined;
  nextSave: NextSave | undefined;
};

type NextSave = () => Promise<unknown>;

export const useAutoSave = (
  args: UseAutoSaveArgs = {},
): UseAutoSaveReturnType => {
  const {
    autoSaveStatusDelay = 300,
    errorMessage = "An error happened while saving",
    retryDelay = 1000,
    retryMessage = "Retry",
  } = args;

  const [autoSaveStack, setAutoSaveStack] = useState<AutoSaveStack>({
    pendingSave: undefined,
    nextSave: undefined,
  });
  const [autoSaveStatusActual, setAutoSaveStatusActual] =
    useState<AutoSaveStatus>("saved");
  const [autoSaveStatusDelayed, setAutoSaveStatusDelayed] =
    useState<AutoSaveStatus>(autoSaveStatusActual);

  const setNextSave = useCallback((nextSave: NextSave) => {
    setAutoSaveStack((prevState) => ({
      ...prevState,
      nextSave,
    }));
  }, []);

  const executeSave = useCallback(
    async (nextSave?: NextSave) => {
      if (nextSave) {
        setAutoSaveStatusActual("saving");

        try {
          await nextSave();

          setAutoSaveStatusActual("saved");
        } catch (error) {
          setAutoSaveStatusActual("failed");
          console.error(errorMessage, error);

          toastError({
            errorMessage,
            retryDelay,
            retryMessage,
            setAutoSaveStatusActual,
            setAutoSaveStack,
          });
        }
      }
    },
    [errorMessage, retryDelay, retryMessage],
  );

  useEffect(() => {
    if (autoSaveStatusActual === "saved" && autoSaveStack.nextSave) {
      void executeSave(autoSaveStack.nextSave);

      setAutoSaveStack({
        pendingSave: autoSaveStack.nextSave,
        nextSave: undefined,
      });
    }
  }, [autoSaveStatusActual, autoSaveStack, executeSave]);

  useEffect(() => {
    if (autoSaveStatusActual === "saving") {
      setAutoSaveStatusDelayed("saving");
    } else {
      const debounceTimeout = setTimeout(() => {
        setAutoSaveStatusDelayed(autoSaveStatusActual);
      }, autoSaveStatusDelay);

      return () => {
        clearTimeout(debounceTimeout);
      };
    }

    return;
  }, [autoSaveStatusActual, autoSaveStatusDelay]);

  return useMemo(
    () => ({
      autoSaveStatus: autoSaveStatusDelayed,
      setNextSave,
    }),
    [autoSaveStatusDelayed, setNextSave],
  );
};

type ToastErrorArgs = {
  errorMessage: string;
  retryDelay: number;
  retryMessage: string;
  setAutoSaveStatusActual: Dispatch<SetStateAction<AutoSaveStatus>>;
  setAutoSaveStack: Dispatch<SetStateAction<AutoSaveStack>>;
};

function toastError(args: ToastErrorArgs) {
  const {
    errorMessage,
    retryDelay,
    retryMessage,
    setAutoSaveStatusActual,
    setAutoSaveStack,
  } = args;
  const toastId = uniqueId();

  toast.error(
    () => (
      <Box gap={8} alignItems="center">
        <Text color="grey1" variant="small">
          {errorMessage}
        </Text>
        <Button
          size="small"
          color="grey"
          onClick={() => {
            toast.dismiss(toastId);

            // Ensure saving is directly propagated before waiting for the retry
            setAutoSaveStatusActual("saving");

            setTimeout(() => {
              // By setting the status to saved, the save effect will be triggered
              // with the latest data to save.
              setAutoSaveStatusActual("saved");
              setAutoSaveStack((prevState) => ({
                nextSave: prevState.nextSave ?? prevState.pendingSave,
                pendingSave: undefined,
              }));
            }, retryDelay);
          }}
        >
          {retryMessage}
        </Button>
      </Box>
    ),
    {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      toastId,
    },
  );
}
