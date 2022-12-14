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
