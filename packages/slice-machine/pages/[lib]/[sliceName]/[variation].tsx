import Builder from "@builders/SliceBuilder";

interface SliceEditorProps {
  openPanel: (priority?: any) => void;
}

const SliceEditor: React.FunctionComponent<SliceEditorProps> = ({
  openPanel,
}) => {
  return <Builder openPanel={openPanel} />;
};

export default SliceEditor;
