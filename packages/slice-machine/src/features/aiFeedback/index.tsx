import {
  AnimatedElement,
  Box,
  IconButton,
  Portal,
  Text,
  Toast,
  Tooltip,
} from "@prismicio/editor-ui";
import { useState } from "react";
import { z } from "zod";

import { telemetry } from "@/apiClient";
import { usePersistedState } from "@/hooks/usePersistedState";
import { getAiFeedbackKey } from "@/utils/localStorageKeys";

export function addAiFeedback({
  type,
  library,
  sliceId,
  variationId,
  langSmithUrl,
}: {
  type: "model";
  library: string;
  sliceId: string;
  variationId: string;
  langSmithUrl?: string;
}) {
  const key = getAiFeedbackKey({ type, library, sliceId, variationId });
  const feedback = JSON.stringify({ langSmithUrl });
  localStorage.setItem(key, feedback);
}

export function removeAiFeedback({
  type,
  library,
  sliceId,
  variationId,
}: {
  type: "model";
  library: string;
  sliceId: string;
  variationId: string;
}) {
  const key = getAiFeedbackKey({ type, library, sliceId, variationId });
  localStorage.removeItem(key);
}

export function useAiFeedback({
  type,
  library,
  sliceId,
  variationId,
}: {
  type: "model";
  library: string;
  sliceId: string;
  variationId: string;
}) {
  const key = getAiFeedbackKey({ type, library, sliceId, variationId });
  const [value, setValue] = usePersistedState(key, undefined, {
    schema: z.object({
      langSmithUrl: z.string().url().optional(),
    }),
  });
  return {
    key,
    value,
    done: () => setValue(undefined),
  };
}

export function AiFeedback({
  type,
  library,
  sliceId,
  variationId,
}: {
  type: "model";
  library: string;
  sliceId: string;
  variationId: string;
}) {
  const { key, value, done } = useAiFeedback({
    type,
    library,
    sliceId,
    variationId,
  });

  const [toastKey, setToastKey] = useState<string>();

  const makeSendFeedback = (feedback: "up" | "down") => () => {
    if (!value) return;
    setToastKey(key);
    void telemetry.track({
      event: "slice-generation-feedback",
      type,
      sliceId,
      variationId,
      feedback,
      langSmithUrl: value.langSmithUrl,
    });
    done();
  };

  const toastShown = Boolean(toastKey);

  const onToastOpenChange = (open: boolean) => {
    if (open) return;
    setToastKey(undefined);
  };

  return (
    <>
      <Portal>
        <Toast
          key={toastKey}
          anchor={
            <Box
              width="100%"
              justifyContent="center"
              position="absolute"
              bottom={64}
            />
          }
          icon="check"
          title={"Thanks for your feedback!"}
          seconds={2}
          open={toastShown}
          onOpenChange={onToastOpenChange}
        />
      </Portal>
      <AnimatedElement>
        {value && (
          <Box
            flexDirection="row"
            justifyContent="end"
            gap={8}
            alignItems="center"
          >
            <Text color="grey11">Did the AI get it right?</Text>
            <Box flexDirection="row" gap={4}>
              <Tooltip
                side="bottom"
                sideOffset={4}
                variant="text"
                content="Looks good"
              >
                <IconButton
                  variant="solid"
                  size="small"
                  icon="thumbUp"
                  onClick={makeSendFeedback("up")}
                />
              </Tooltip>
              <Tooltip
                side="bottom"
                sideOffset={4}
                variant="text"
                content="Needs improvement"
              >
                <IconButton
                  variant="solid"
                  size="small"
                  icon="thumbDown"
                  onClick={makeSendFeedback("down")}
                />
              </Tooltip>
            </Box>
          </Box>
        )}
      </AnimatedElement>
    </>
  );
}
