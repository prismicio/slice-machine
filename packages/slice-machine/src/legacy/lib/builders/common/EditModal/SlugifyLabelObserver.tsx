import { useField } from "formik";
import { useEffect, useRef } from "react";

import { slugify } from "@/legacy/lib/utils/str";

export function SlugifyLabelObserver() {
  const [{ value: label }] = useField<string>("config.label");
  const [{ value: id }, { initialValue: initialId }, { setValue: setId }] =
    useField<string>("id");

  // if we're editing an existing field, we don't want to keep slugifying the label
  const wasIdChangedRef = useRef(initialId != null && initialId.length > 0);

  useEffect(() => {
    if (!wasIdChangedRef.current) {
      setId(slugify(label));
    }
  }, [label]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // if the user changed the id directly, we opt out of the slugification
    if (!wasIdChangedRef.current && id.length > 0 && id !== slugify(label)) {
      wasIdChangedRef.current = true;
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
}
