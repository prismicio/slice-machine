import type { FC, SVGProps } from "react";

export const UndoIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M9.5 12L6 9.5L9.5 7V9.5V12Z" fill="currentColor" />
    <path
      d="M6 9.5H11C14.3 9.5 17 12.2 17 15.5V17.5M6 9.5L9.5 12V9.5V7L6 9.5Z"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </svg>
);
