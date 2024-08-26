import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

import { ActionQueueStatus } from "@/hooks/useActionQueue";

export function useOnSaveWithSuccessOnNewFieldSync<
  TProps extends unknown[],
  TField,
>(
  onSave: (...props: TProps) => void,
  fields: TField[] | undefined,
  syncStatus: ActionQueueStatus,
) {
  const wasFieldCreatedRef = useRef(false);
  const previousFieldsRef = useRef<TField[]>([]);

  useEffect(() => {
    if (!wasFieldCreatedRef.current || !fields || syncStatus !== "done") return;

    if (fields.length > previousFieldsRef.current.length) {
      toast.success("Field created");
      wasFieldCreatedRef.current = false;
    }
  }, [syncStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  return (...props: TProps) => {
    previousFieldsRef.current = fields ?? [];
    onSave(...props);
    wasFieldCreatedRef.current = true;
  };
}
