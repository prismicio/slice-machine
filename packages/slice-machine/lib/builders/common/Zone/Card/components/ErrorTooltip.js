import { Fragment } from "react";

import ReactTooltip from "react-tooltip";
import { FaRegQuestionCircle } from "react-icons/fa";

const ErrorTooltip = ({ errors }) => {
  if (errors && errors.id) {
    return (
      <Fragment>
        <ReactTooltip type="light" multiline border borderColor={"tomato"} />
        <FaRegQuestionCircle
          color={"tomato"}
          data-tip={errors.id}
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
