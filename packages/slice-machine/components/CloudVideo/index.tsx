import { Video as CldVideo } from "cloudinary-react";
import type { CSSProperties, FC } from "react";

const Video: FC<{
  publicId: string;
  onPlay?: () => void;
  style?: CSSProperties;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  poster?: string;
}> = ({
  publicId,
  onPlay,
  style,
  autoPlay = true,
  controls = true,
  loop = true,
  poster,
}) => {
  return (
    <CldVideo
      cloudName="dmtf1daqp"
      autoPlay={autoPlay}
      controls={controls}
      loop={loop}
      poster={poster}
      style={{
        maxWidth: "100%",
        height: "auto",
        ...style,
      }}
      onPlay={onPlay}
      publicId={publicId}
    />
  );
};

export default Video;
