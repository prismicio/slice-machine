import Builder from "@builders/SliceBuilder";

const SliceEditor: React.FunctionComponent<{
  openPanel: (priority?: any) => void;
}> = ({ openPanel }) => {
  return <Builder openPanel={openPanel} />;
};

export default SliceEditor;
