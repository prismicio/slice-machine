import { Video as CldVideo } from "cloudinary-react";
import { FC } from "react";

const Video: FC<{
  publicId: string;
  onPlay?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: Record<string, any>;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
}> = ({
  publicId,
  onPlay,
  style,
  autoPlay = true,
  controls = true,
  loop = true,
}) => {
  return (
    <CldVideo
      cloudName="dmtf1daqp"
      autoPlay={autoPlay}
      controls={controls}
      loop={loop}
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
