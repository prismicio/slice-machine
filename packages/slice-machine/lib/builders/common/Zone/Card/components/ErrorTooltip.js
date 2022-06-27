import { Fragment } from "react";

import ReactTooltip from "react-tooltip";
import { FaRegQuestionCircle } from "react-icons/fa";

const ErrorTooltip = ({ error }) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (error) {
    return (
      <Fragment>
        <ReactTooltip type="light" multiline border borderColor={"tomato"} />
        <FaRegQuestionCircle
          color={"tomato"}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
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
