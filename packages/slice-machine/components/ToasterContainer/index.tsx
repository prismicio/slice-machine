import React from "react";

import {
  ToastContainer as ReactToastifyContainer,
  toast,
  TypeOptions,
  Slide,
} from "react-toastify";

import { MdDangerous, MdDone, MdError, MdWarning } from "react-icons/md";

const getIconAccordingToasterType = ({
  type,
}: {
  type: TypeOptions;
}): JSX.Element | null => {
  switch (type) {
    case toast.TYPE.INFO:
      return <MdError />;
    case toast.TYPE.ERROR:
      return <MdDangerous />;
    case toast.TYPE.SUCCESS:
      return <MdDone />;
    case toast.TYPE.WARNING:
      return <MdWarning />;
    default:
      return null;
  }
};

const ToastContainer: React.FunctionComponent = () => {
  return (
    <ReactToastifyContainer
      autoClose={2500}
      hideProgressBar
      transition={Slide}
      closeButton={false}
      position={toast.POSITION.TOP_CENTER}
      icon={getIconAccordingToasterType}
      style={{
        left: "50%",
      }}
    />
  );
};

export default ToastContainer;

function truncated(str: string): string {
  const ellipsis = "...";
  const maxLength = 28;
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + ellipsis;
}

export const ToastMessageWithPath: React.FC<{
  message: string;
  path: string;
}> = ({ message, path }) => {
  const maybeTruncatedPath = truncated(path);

  return (
    <span>
      {message}
      <code>{maybeTruncatedPath}</code>
    </span>
  );
};

export const SliceToastMessage: React.FC<{
  path: string;
}> = (props) => (
  <ToastMessageWithPath message="Slice saved successfully at " {...props} />
);
