import { useField } from "formik";
import { useEffect, useRef } from "react";

import { slugify } from "@/legacy/lib/utils/str";

export function SlugifyLabelObserver() {
  const [{ value: label }] = useField<string | undefined>("config.label");
  const [{ value: id }, { initialValue: initialId }, { setValue: setId }] =
    useField<string | undefined>("id");

  const wasIdChangedRef = useRef(
    /* if we're editing an existing field, we don't want to keep slugifying the label */
    initialId != null && initialId.length > 0,
  );

  useEffect(() => {
    if (!wasIdChangedRef.current && label != null) {
      setId(slugify(label));
    }
  }, [label]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const isIdEmpty = id == null || id.length === 0;
    if (wasIdChangedRef.current) {
      if (isIdEmpty) {
        // if the id was cleared, we resume the slugification
        wasIdChangedRef.current = false;
      }
    } else if (!isIdEmpty && (label == null || id !== slugify(label))) {
      // if the id was manually set, we opt out of the slugification
      wasIdChangedRef.current = true;
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
}
