import { FaRegQuestionCircle } from "react-icons/fa";
import ReactTooltip from "react-tooltip";

import { ReactTooltipPortal } from "@/legacy/components/ReactTooltipPortal";

interface ErrorTooltip {
  error?: string;
}

export const ErrorTooltip: React.FC<ErrorTooltip> = ({ error }) => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (error) {
    return (
      <>
        <ReactTooltipPortal>
          <ReactTooltip type="light" multiline border borderColor={"tomato"} />
        </ReactTooltipPortal>
        <FaRegQuestionCircle
          color={"tomato"}
          data-tip={error}
          style={{ position: "absolute", right: "8px" }}
          size={16}
        />
      </>
    );
  }
  return null;
};
