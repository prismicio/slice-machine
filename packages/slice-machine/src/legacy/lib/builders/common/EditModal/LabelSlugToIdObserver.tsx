import { useOnChange } from "@prismicio/editor-support/React";
import { useField } from "formik";
import { useState } from "react";

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
  const [{ value: id }, idMeta, idHelpers] = useField<string | undefined>("id");

  const [isIdManual, setIdManual] = useState(
    idMeta.initialValue != null && idMeta.initialValue.length > 0, // rule 2
  );

  useOnChange(label, () => {
    if (isIdManual || label == null) return;
    idHelpers.setValue(slugify(label));
  });

  useOnChange(id, () => {
    const isIdEmpty = id == null || id.length === 0;
    if (isIdManual) {
      if (!isIdEmpty) return;
      setIdManual(false); // rule 3
    } else if (!isIdEmpty && (label == null || id !== slugify(label))) {
      setIdManual(true); // rule 1
    }
  });
}
