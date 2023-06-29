import type { FC, SVGProps } from "react";

export const FolderIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 9.5C8 8.67157 8.67157 8 9.5 8H13.382C13.9501 8 14.4695 8.321 14.7236 8.82918L15.809 11H18H22.5C23.3284 11 24 11.6716 24 12.5V22.5001C24 23.3285 23.3284 24.0001 22.5 24.0001H12.25H9.5C8.67157 24.0001 8 23.3285 8 22.5001V11.5V9.5ZM14.691 11L13.8292 9.27639C13.7445 9.107 13.5714 9 13.382 9H9.5C9.22386 9 9 9.22386 9 9.5V11H14.691ZM9 12V22.5001C9 22.7762 9.22386 23.0001 9.5 23.0001H12.25H22.5C22.7761 23.0001 23 22.7762 23 22.5001V12.5C23 12.2239 22.7761 12 22.5 12H18H15.5H9Z"
    />
  </svg>
);
