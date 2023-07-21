import ReactTooltip from "react-tooltip";
import { FaRegQuestionCircle } from "react-icons/fa";

interface ErrorTooltip {
  error?: string;
}

export const ErrorTooltip: React.FC<ErrorTooltip> = ({ error }) => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (error) {
    return (
      <>
        <ReactTooltip type="light" multiline border borderColor={"tomato"} />
        <FaRegQuestionCircle
          color={"tomato"}
          data-tip={error}
          style={{
            position: "relative",
            right: "24px",
            height: "24px",
          }}
          size={56}
        />
      </>
    );
  }
  return null;
};
