import { useField } from "formik";
import { useEffect, useRef } from "react";

import { slugify } from "@/legacy/lib/utils/str";

/**
 * Observes formik values and reacts to `label` changes to slugify it to set the value of `id`.
 *
 * Rules:
 * 1. If the id was manually set, we opt out of the slugification
 * 2. If we're editing an existing field, we don't want to keep slugifying the label
 * 3. If the id was cleared, we resume the slugification
 */
export function LabelSlugToIdObserver() {
  const [{ value: label }] = useField<string | undefined>("config.label");
  const [{ value: id }, { initialValue: initialId }, { setValue: setId }] =
    useField<string | undefined>("id");

  const wasIdChangedRef = useRef(initialId != null && initialId.length > 0); // rule 2

  useEffect(() => {
    if (!wasIdChangedRef.current && label != null) {
      setId(slugify(label));
    }
  }, [label]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const isIdEmpty = id == null || id.length === 0;
    if (wasIdChangedRef.current) {
      if (isIdEmpty) {
        wasIdChangedRef.current = false; // rule 3
      }
    } else if (!isIdEmpty && (label == null || id !== slugify(label))) {
      wasIdChangedRef.current = true; // rule 1
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
}
