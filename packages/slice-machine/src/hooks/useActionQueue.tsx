import { Box, Button, Text } from "@prismicio/editor-ui";
import { uniqueId } from "lodash";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";

export type ActionQueueStatus = "pending" | "done" | "failed";

type UseActionQueueArgs = {
  actionQueueStatusDelay?: number;
  errorMessage: string;
  retryDelay?: number;
  retryMessage?: string;
};

type UseActionQueueReturnType = {
  actionQueueStatus: ActionQueueStatus;
  setNextAction: (nextAction: NextAction) => void;
};

type ActionQueueStack = {
  pendingAction: NextAction | undefined;
  nextAction: NextAction | undefined;
};

type NextAction = () => Promise<unknown>;

export const useActionQueue = (
  args: UseActionQueueArgs,
): UseActionQueueReturnType => {
  const {
    actionQueueStatusDelay = 300,
    errorMessage,
    retryDelay = 1000,
    retryMessage = "Retry",
  } = args;

  const [actionQueueStack, setActionQueueStack] = useState<ActionQueueStack>({
    pendingAction: undefined,
    nextAction: undefined,
  });
  const [actionQueueStatusActual, setActionQueueStatusActual] =
    useState<ActionQueueStatus>("done");
  const [actionQueueStatusDelayed, setActionQueueStatusDelayed] =
    useState<ActionQueueStatus>(actionQueueStatusActual);

  const setNextAction = useCallback((nextAction: NextAction) => {
    setActionQueueStack((prevState) => ({
      ...prevState,
      nextAction,
    }));
  }, []);

  const executeAction = useCallback(
    async (nextAction?: NextAction) => {
      if (nextAction) {
        setActionQueueStatusActual("pending");

        try {
          await nextAction();

          setActionQueueStatusActual("done");
        } catch (error) {
          setActionQueueStatusActual("failed");
          console.error(errorMessage, error);

          toastError({
            errorMessage,
            retryDelay,
            retryMessage,
            setActionQueueStatusActual,
            setActionQueueStack,
          });
        }
      }
    },
    [errorMessage, retryDelay, retryMessage],
  );

  useEffect(() => {
    if (actionQueueStatusActual === "done" && actionQueueStack.nextAction) {
      void executeAction(actionQueueStack.nextAction);

      setActionQueueStack({
        pendingAction: actionQueueStack.nextAction,
        nextAction: undefined,
      });
    }
  }, [actionQueueStatusActual, actionQueueStack, executeAction]);

  useEffect(() => {
    if (actionQueueStatusActual === "pending") {
      setActionQueueStatusDelayed("pending");
    } else {
      const delayedTimeout = setTimeout(() => {
        setActionQueueStatusDelayed(actionQueueStatusActual);
      }, actionQueueStatusDelay);

      return () => {
        clearTimeout(delayedTimeout);
      };
    }

    return;
  }, [actionQueueStatusActual, actionQueueStatusDelay]);

  return useMemo(
    () => ({
      actionQueueStatus: actionQueueStatusDelayed,
      setNextAction,
    }),
    [actionQueueStatusDelayed, setNextAction],
  );
};

type ToastErrorArgs = {
  errorMessage: string;
  retryDelay: number;
  retryMessage: string;
  setActionQueueStatusActual: Dispatch<SetStateAction<ActionQueueStatus>>;
  setActionQueueStack: Dispatch<SetStateAction<ActionQueueStack>>;
};

function toastError(args: ToastErrorArgs) {
  const {
    errorMessage,
    retryDelay,
    retryMessage,
    setActionQueueStatusActual,
    setActionQueueStack,
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
            setActionQueueStatusActual("pending");

            setTimeout(() => {
              // By setting the status to done, the effect will be triggered
              // with the latest action to process.
              setActionQueueStatusActual("done");
              setActionQueueStack((prevState) => ({
                nextAction: prevState.nextAction ?? prevState.pendingAction,
                pendingAction: undefined,
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
