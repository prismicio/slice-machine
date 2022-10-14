import { ThemeUIStyleObject } from "theme-ui";
import { AiOutlineCamera } from "react-icons/ai";
import { Button } from "@components/Button";

const UpdateScreenshotButton = ({
  onUpdateScreenshot,
  sx,
}: {
  onUpdateScreenshot: (e: React.MouseEvent) => void;
  sx?: ThemeUIStyleObject;
}) => (
  <Button
    onClick={onUpdateScreenshot}
    variant="secondarySmall"
    sx={{ fontWeight: "bold", ...sx }}
    Icon={AiOutlineCamera}
    label="Update screenshot"
  />
);

export default UpdateScreenshotButton;
