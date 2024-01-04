import {
  useCallback,
  useState,
  useEffect,
  SetStateAction,
  Dispatch,
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

type AutoSaveState = {
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

  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    pendingSave: undefined,
    nextSave: undefined,
  });
  const [autoSaveStatusActual, setAutoSaveStatusActual] =
    useState<AutoSaveStatus>("saved");
  const [autoSaveStatusDelayed, setAutoSaveStatusDelayed] =
    useState<AutoSaveStatus>(autoSaveStatusActual);

  const setNextSave = useCallback((nextSave: NextSave) => {
    setAutoSaveState((prevState) => ({
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
          // We reset the pending save only in case of a success because
          // we keep the pending save in case of a failure for the retry.
          setAutoSaveState((prevState) => ({
            ...prevState,
            pendingSave: undefined,
          }));
        } catch (error) {
          setAutoSaveStatusActual("failed");
          console.error(errorMessage, error);

          toastError({
            errorMessage,
            retryDelay,
            retryMessage,
            setAutoSaveStatusActual,
          });
        }
      }
    },
    [errorMessage, retryDelay, retryMessage],
  );

  useEffect(() => {
    // When status is saved we want to trigger a save if necessary.
    // 'pendingSave' is only set when a save failed and the user clicked on retry.
    if (
      autoSaveStatusActual === "saved" &&
      (autoSaveState.nextSave || autoSaveState.pendingSave)
    ) {
      // We prefer to use nextSave if it's defined to ensure even with a retry
      // we take the latest data to save.
      const nextSave = autoSaveState.nextSave ?? autoSaveState.pendingSave;
      void executeSave(nextSave);

      setAutoSaveState({
        pendingSave: nextSave,
        nextSave: undefined,
      });
    }
  }, [autoSaveStatusActual, autoSaveState, executeSave]);

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

  return { autoSaveStatus: autoSaveStatusDelayed, setNextSave };
};

type ToastErrorArgs = {
  errorMessage: string;
  retryDelay: number;
  retryMessage: string;
  setAutoSaveStatusActual: Dispatch<SetStateAction<AutoSaveStatus>>;
};

function toastError(args: ToastErrorArgs) {
  const { errorMessage, retryDelay, retryMessage, setAutoSaveStatusActual } =
    args;
  const toastId = uniqueId();

  toast.error(
    <Box gap={8} alignItems="center">
      <Text color="grey1" variant="small">
        {errorMessage}
      </Text>
      <Button
        size="small"
        color="grey"
        onClick={() => {
          toast.dismiss(toastId);

          setAutoSaveStatusActual("saving");
          setTimeout(() => {
            // By setting the status to saved, the save effect will be triggered
            // with the latest data to save.
            setAutoSaveStatusActual("saved");
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
