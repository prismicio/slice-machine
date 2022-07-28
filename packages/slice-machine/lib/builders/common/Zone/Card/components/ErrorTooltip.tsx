import { Fragment } from "react";

import ReactTooltip from "react-tooltip";
import { FaRegQuestionCircle } from "react-icons/fa";

interface ErrorTooltip {
  error?: string;
}

const ErrorTooltip: React.FC<ErrorTooltip> = ({ error }) => {
  if (error) {
    return (
      <Fragment>
        <ReactTooltip type="light" multiline border borderColor={"tomato"} />
        <FaRegQuestionCircle
          color={"tomato"}
          data-tip={error}
          style={{
            position: "relative",
            top: "1px",
            right: "24px",
            width: "24px",
          }}
        />
      </Fragment>
    );
  }
  return null;
};

export default ErrorTooltip;
