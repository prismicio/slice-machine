import type { FC, PropsWithChildren } from "react";
import { createPortal } from "react-dom";
import { BaseStyles } from "theme-ui";

export const ReactTooltipPortal: FC<PropsWithChildren> = ({ children }) =>
  createPortal(<BaseStyles>{children}</BaseStyles>, document.body);
