import { Button } from "@prismicio/editor-ui";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
} from "react";

type PushChangesButtonProps = Pick<
  ComponentPropsWithoutRef<typeof Button>,
  "disabled" | "loading" | "onClick"
>;

export const PushChangesButton = forwardRef<
  ElementRef<typeof Button>,
  PushChangesButtonProps
>((props, ref) => (
  <Button {...props} ref={ref} startIcon="upload">
    Push
  </Button>
));
