import React, {
  useState,
  FC,
  PropsWithChildren,
  useEffect,
  useCallback,
} from "react";
import * as styles from "./VideoPopover.css";
import { HoverCard } from "../HoverCard";
import { Button } from "@prismicio/editor-ui";
import { Video as CldVideo } from "cloudinary-react";
import { CloseIcon } from "@src/icons/CloseIcon";

export const VideoContainer: FC<{
  onClose: () => void;
  onPlay: () => void;
  publicId: string;
  cloudName: string;
  thumbnail?: string;
}> = ({ publicId, cloudName, thumbnail, onClose, onPlay }) => {
  return (
    <div className={styles.videoContainer}>
      <div className={styles.videoHeader}>
        <span>Prismic Academy©</span>

        <button className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </button>
      </div>

      <CldVideo
        // publicId="Tooltips/pa-course-overview_eaopsn"
        // cloudName="dmtf1daqp"
        publicId={publicId}
        cloudName={cloudName}
        poster={thumbnail}
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

type Timer = ReturnType<typeof setTimeout> | null;

function useTimerWhen(condition: boolean, fn: () => void, delay: number) {
  const [timer, setTimer] = useState<Timer>(null);
  useEffect(() => {
    if (condition && timer === null) {
      const timerId = setTimeout(fn, delay);
      setTimer(timerId);
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer);
        setTimer(null);
      }
    };
  }, [condition, fn, delay, timer, setTimer]);
}

export const VideoPopover: React.FC<
  PropsWithChildren<{
    open: boolean;
    onClose: () => void;
    onPlay: () => void;
    publicId: string;
    cloudName: string;
    delay?: number;
    thumbnail?: string;
  }>
> = ({
  children,
  onClose,
  onPlay,
  open,
  delay = 5000,
  publicId,
  cloudName,
  thumbnail,
}) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  const handleClose = React.useCallback(() => {
    onClose();
    setOpen(false);
  }, [onClose, setOpen]);

  const handleDefaultOpening = useCallback(
    () => setOpen((wasOpen) => wasOpen === false),
    [setOpen]
  );

  // timeout system to open the tooltip
  useTimerWhen(open, handleDefaultOpening, delay);

  const handleChange = (value: boolean) => {
    if (value === false) {
      handleClose();
    } else {
      setOpen(value);
    }
  };

  return (
    <HoverCard
      anchor={children}
      open={isOpen}
      onOpenChange={handleChange}
      openDelay={delay}
    >
      <VideoContainer
        onClose={handleClose}
        onPlay={onPlay}
        cloudName={cloudName}
        publicId={publicId}
        thumbnail={thumbnail}
      />
    </HoverCard>
  );
};
