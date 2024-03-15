import type { FC, SVGProps } from "react";

export const MathPlusIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M16 9C15.7239 9 15.5 9.22386 15.5 9.5V15.5H9.5C9.22386 15.5 9 15.7239 9 16C9 16.2761 9.22386 16.5 9.5 16.5H15.5V22.5C15.5 22.7761 15.7239 23 16 23C16.2761 23 16.5 22.7761 16.5 22.5V16.5H22.5C22.7761 16.5 23 16.2761 23 16C23 15.7239 22.7761 15.5 22.5 15.5H16.5V9.5C16.5 9.22386 16.2761 9 16 9Z"
      fill="currentColor"
    />
  </svg>
);
