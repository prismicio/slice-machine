import type { FC, SVGProps } from "react";

export const Synced: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M15.5 6L8 15.5L4.5 11"
      stroke="#6F6E77"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
