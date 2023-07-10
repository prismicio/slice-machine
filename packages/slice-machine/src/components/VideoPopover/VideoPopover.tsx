import React, { useState, FC, PropsWithChildren } from "react";
import * as styles from "./VideoPopover.css";
import { Popover, Button } from "@prismicio/editor-ui";
import { Video as CldVideo } from "cloudinary-react";
import { CloseIcon } from "@src/icons/CloseIcon";

export const Video: FC<VideoProps> = (props) => (
  <CldVideo
    {...props}
    publicId="Tooltips/pa-course-overview_eaopsn"
    cloudName="dmtf1daqp"
    autoPlay={false} // change later
    controls={true}
    // loop={loop}
    // poster={poster} // TODO: get a thumbnail
    // onPlay={onPlay}
  />
);

export const VideoContainer: FC<{
  onClose: () => void;
  onPlay: () => void;
}> = ({ onClose, onPlay }) => {
  return (
    <div className={styles.videoContainer}>
      <div className={styles.videoHeader}>
        <span>Prismic Academy©</span>

        <button className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </button>
      </div>

      <Video className={styles.videoPlayer} onPlay={onPlay} />

      <div className={styles.videoFooter}>
        <p className={styles.videoDescription}>
          Lorem ipsum dolor sit amet consectetur. Aenean purus aliquam vel eget
          vitae etiam
        </p>

        <Button
          variant="secondary"
          className={styles.videoButton}
          onClick={onClose}
        >
          Got it
        </Button>
      </div>
    </div>
  );
};

// https://res.cloudinary.com/dmtf1daqp/video/upload/v1688550649/Tooltips/pa-course-overview_eaopsn.mov
export const VideoPopover: React.FC<
  PropsWithChildren<{
    open: boolean;
    onClose: () => void;
    onPlay: () => void;
  }>
> = ({ children, onClose, onPlay, open }) => {
  const [isOpen, setOpen] = useState<boolean>(open);
  // const handleHover = () => setOpen((wasOpen) => !wasOpen);

  const h = (v: boolean) => {
    console.log("Hover");
    console.log({ v });
    setOpen(v);
  };

  return (
    <Popover
      open={isOpen}
      anchor={children}
      align="start"
      onOpenChange={h}
      onMouseOverChange={h}
      openDelay={0}
      closeDelay={0}
    >
      <VideoContainer onClose={onClose} onPlay={onPlay} />
    </Popover>
  );
};
