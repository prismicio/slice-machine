import { Button, Text, ThemeUIStyleObject } from "theme-ui";
import { AiOutlineCamera } from "react-icons/ai";

const UpdateScreenshotButton = ({
  onUpdateScreenshot,
  sx,
}: {
  onUpdateScreenshot: (e: React.MouseEvent) => void;
  sx?: ThemeUIStyleObject;
}) => (
  <Button onClick={onUpdateScreenshot} variant="white" sx={sx}>
    <Text sx={{ color: "greyIcon" }}>
      <AiOutlineCamera
        size={16}
        style={{
          marginRight: "8px",
          position: "relative",
          top: "3px",
        }}
      />
    </Text>
    <Text sx={{ lineHeight: "24px", fontSize: "12px" }}>Update screenshot</Text>
  </Button>
);

export default UpdateScreenshotButton;
