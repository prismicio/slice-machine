import Modal from "react-modal";

const SliceMachineModal: React.FunctionComponent<Modal.Props> = (props) => {
  const modalStyle = {
    content: {
      padding: 0,
      paddingBottom: 40,
      bottom: "auto",
      top: "10%",
      maxWidth: 900,
      margin: "auto",
      border: 0,
      background: 0,
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
