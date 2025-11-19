import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";

export const FigmaIcon = forwardRef<
  ElementRef<"svg">,
  ComponentPropsWithoutRef<"svg">
>((props, ref) => {
  let { width, height } = props;
  if (width === undefined && height === undefined) {
    width = 10;
    height = 16;
  }

  return (
    <svg
      ref={ref}
      viewBox="0 0 10 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      height={height}
      width={width}
    >
      <path
        d="M5 7.83323C5 6.45253 6.11928 5.33325 7.49997 5.33325C8.8807 5.33325 10 6.45255 10 7.83328V8.16656C10 9.54728 8.8807 10.6666 7.49997 10.6666C6.11928 10.6666 5 9.54731 5 8.16661V7.83323Z"
        fill="#1ABCFE"
      />
      <path
        d="M0 13.3334C0 11.8607 1.19391 10.6667 2.66667 10.6667H5V13.5001C5 14.8808 3.88071 16.0001 2.5 16.0001C1.11929 16.0001 0 14.8808 0 13.5001L0 13.3334Z"
        fill="#0ACF83"
      />
      <path
        d="M5 0V5.33333H7.33333C8.80609 5.33333 10 4.13943 10 2.66667C10 1.19391 8.80609 0 7.33333 0L5 0Z"
        fill="#FF7262"
      />
      <path
        d="M0 2.66659C0 4.13934 1.19391 5.33325 2.66667 5.33325L5 5.33325L5 -8.15392e-05L2.66667 -8.15392e-05C1.19391 -8.15392e-05 0 1.19383 0 2.66659Z"
        fill="#F24E1E"
      />
      <path
        d="M0 8.00008C0 9.47284 1.19391 10.6667 2.66667 10.6667H5L5 5.33341L2.66667 5.33341C1.19391 5.33341 0 6.52732 0 8.00008Z"
        fill="#A259FF"
      />
    </svg>
  );
});
