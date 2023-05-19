import clsx from "clsx";
import { forwardRef, useLayoutEffect } from "react";

import { IconName } from "./iconNames";

import * as styles from "./Icon.css";

type IconProps = Readonly<{
  name: IconName;
  className?: string;
}>;

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, className },
  ref
) {
  const iconPath = `../../icons/${name}.svg`;

  useLayoutEffect(() => maybeAddIconTemplate(iconPath));

  return (
    <svg ref={ref} className={clsx(styles.root, className)} fill="currentColor">
      <use href={"#" + iconPath} />
    </svg>
  );
});

const allIcons = import.meta.glob<string>(`../../icons/*.svg`, {
  eager: true,
  as: "raw",
});

const addedIcons = new Set<string>();

// We could just add the icons directly to body,
// but it would create a lot of noise in the DOM.
let iconContainer: HTMLElement | undefined;

function maybeAddIconTemplate(iconPath: string) {
  if (addedIcons.has(iconPath)) return;
  addedIcons.add(iconPath);

  const iconString = allIcons[iconPath];

  // Should never happen.
  if (!iconString) return;

  if (!iconContainer) {
    iconContainer = document.createElement("div");
    iconContainer.style.display = "none";
    document.body.appendChild(iconContainer);
  }

  const placeholder = document.createElement("div");
  placeholder.innerHTML = iconString;
  const icon = placeholder.firstElementChild;

  // Should never happen
  if (!icon) return;

  icon.setAttribute("id", iconPath);
  iconContainer.appendChild(icon);
}
