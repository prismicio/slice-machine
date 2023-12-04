import type { FC, SVGProps } from "react";

export const LoginIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <g fill="none" fillRule="evenodd">
      <path d="M0 0h24v24H0z" />
      <path
        fill="currentColor"
        d="M7.5 4A1.5 1.5 0 0 0 6 5.5v3a.5.5 0 0 0 1 0v-3a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-3a.5.5 0 1 0-1 0v3A1.5 1.5 0 0 0 7.5 20h10a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 17.5 4H13zm6.25 8L10 15v-2.5H3.5a.5.5 0 1 1 0-1H10V9z"
      />
    </g>
  </svg>
);
