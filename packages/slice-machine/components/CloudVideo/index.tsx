import { Video as CldVideo } from "cloudinary-react";
import { FC } from "react";

const Video: FC<{
  publicId: string;
  onPlay?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: Record<string, any>;
}> = ({ publicId, onPlay, style }) => {
  return (
    <CldVideo
      cloudName="dmtf1daqp"
      autoPlay
      controls
      loop
      style={{
        maxWidth: "100%",
        height: "auto",
        ...style,
      }}
      {...(onPlay
        ? {
            onplay,
          }
        : {})}
      publicId={publicId}
    />
  );
};

export default Video;
