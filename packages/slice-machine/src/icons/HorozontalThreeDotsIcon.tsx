import { FC, SVGProps } from "react";

export const HorozontalThreeDotsIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="49"
    height="12"
    viewBox="0 0 49 12"
    {...props}
  >
    <circle cx="5.5" cy="6" r="5.5" />
    <circle cx="24.5" cy="6" r="5.5" />
    <circle cx="43.5" cy="6" r="5.5" />
  </svg>
);
