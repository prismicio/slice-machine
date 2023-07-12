import React, { useState, FC, PropsWithChildren } from "react";
import * as styles from "./VideoPopover.css";
import { HoverCard } from "../HoverrCard";
import { Button } from "@prismicio/editor-ui";
import { Video as CldVideo } from "cloudinary-react";
import { CloseIcon } from "@src/icons/CloseIcon";

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

      <CldVideo
        publicId="Tooltips/pa-course-overview_eaopsn"
        cloudName="dmtf1daqp"
        className={styles.videoPlayer}
        onPlay={onPlay}
        autoPlay={false}
        controls={true}
        // poster={poster} // TODO: get a thumbnail
      />

      <div className={styles.videoFooter}>
        <p className={styles.videoDescription}>
          Lorem ipsum dolor sit amet consectetur.
          <br />
          Aenean purus aliquam vel eget vitae etiam
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

export const VideoPopover: React.FC<
  PropsWithChildren<{
    open: boolean;
    onClose: () => void;
    onPlay: () => void;
  }>
> = ({ children, onClose, onPlay, open }) => {
  const [isOpen, setOpen] = useState<boolean>(open);

  const handleClose = React.useCallback(() => {
    onClose();
    setOpen((wasOpen) => !wasOpen);
  }, [onClose, setOpen]);

  return (
    <HoverCard
      anchor={children}
      open={isOpen}
      onOpenChange={handleClose}
      openDelay={500}
    >
      <VideoContainer onClose={handleClose} onPlay={onPlay} />
    </HoverCard>
  );
};
