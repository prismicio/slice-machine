import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { useEffect, useRef } from "react";

import { managerClient } from "@/managerClient";

/**
 * Keeps track of the existing slices in the project.
 * Re-fetches them when the modal is opened.
 */
export function useExistingSlices({ open }: { open: boolean }) {
  const ref = useRef<SharedSlice[]>([]);

  useEffect(() => {
    if (!open) return;

    ref.current = [];
    managerClient.slices
      .readAllSlices()
      .then((slices) => {
        ref.current = slices.models.map(({ model }) => model);
      })
      .catch(() => null);
  }, [open]);

  return ref;
}
