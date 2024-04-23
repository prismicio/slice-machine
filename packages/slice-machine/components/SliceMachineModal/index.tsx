import Modal from "react-modal";
import * as React from "react";

const SliceMachineModal: React.FunctionComponent<Modal.Props> = (props) => {
  const modalStyle = {
    content: {
      padding: "0px",
      top: "10%",
      maxWidth: "950px",
      margin: "auto",
      border: "0",
      background: "0",
      borderRadius: "6px",
      ...props.style?.content,
    },
    overlay: {
      backgroundColor: "rgba(11, 11, 12, 0.9)",
      backdropFilter: "blur(3px)",
      overflow: "auto",
      ...props.style?.overlay,
    },
  };

  return <Modal {...props} style={modalStyle} />;
};

export default SliceMachineModal;
