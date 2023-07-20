import {
  useState,
  FC,
  PropsWithChildren,
  useEffect,
  useCallback,
  useRef,
} from "react";
import * as styles from "./VideoPopover.css";
import { HoverCard, HoverCardProps } from "../HoverCard";
import { Button } from "@prismicio/editor-ui";
import { Video as CldVideo } from "cloudinary-react";
import { CloseIcon } from "@src/icons/CloseIcon";

type VideoPopoverProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  onPlay?: () => void;
  publicId: string;
  cloudName: string;
  delay?: number;
  thumbnail?: string;
  side?: HoverCardProps["side"];
  sideOffset?: HoverCardProps["sideOffset"];
  arrowSize?: number;
  align?: HoverCardProps["align"];
  alignOffset?: HoverCardProps["alignOffset"];
}>;

export const VideoPopover: FC<VideoPopoverProps> = ({
  children,
  onClose,
  onPlay,
  open,
  delay = 5000,
  publicId,
  cloudName,
  thumbnail,
  side,
  sideOffset,
  arrowSize,
  align,
  alignOffset,
}) => {
  const [isOpen, setOpen] = useState<boolean>(false);

  const handleClose = useCallback(() => {
    onClose();
    setOpen(false);
  }, [onClose, setOpen]);

  const handleDefaultOpening = useCallback(
    () => setOpen((wasOpen) => wasOpen === false),
    [setOpen]
  );

  useTimerWhen(open, handleDefaultOpening, delay);

  const handleChange = (value: boolean) => {
    if (value === true && open === true) {
      setOpen(value);
    }
  };

  return (
    <HoverCard
      anchor={children}
      open={isOpen}
      onOpenChange={handleChange}
      openDelay={delay}
      side={side}
      sideOffset={sideOffset}
      arrowSize={arrowSize}
      align={align}
      alignOffset={alignOffset}
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

type VideoContainerProps = {
  onClose: () => void;
  onPlay?: () => void;
  publicId: string;
  cloudName: string;
  thumbnail?: string;
};

export const VideoContainer: FC<VideoContainerProps> = ({
  publicId,
  cloudName,
  thumbnail,
  onClose,
  onPlay,
}) => {
  const ref = useRef(null);
  useOnClickOutside(ref, onClose);
  return (
    <div className={styles.videoContainer} ref={ref}>
      <div className={styles.videoHeader}>
        <span>Need help?</span>

        <button className={styles.closeButton} onClick={onClose}>
          <CloseIcon />
        </button>
      </div>

      <CldVideo
        publicId={publicId}
        cloudName={cloudName}
        poster={thumbnail}
        className={styles.videoPlayer}
        onPlay={onPlay}
        autoPlay={false}
        controls={true}
      />

      <div className={styles.videoFooter}>
        <div className={styles.videoDescription}>
          Learn how to turn a Next.js website into a page builder powered by
          Prismic.
        </div>

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

function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.MutableRefObject<T | null>,
  handler: () => void
) {
  useEffect(() => {
    function handleClicksOutside(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        ref.current?.contains(event.target) === false
      ) {
        handler();
      }
    }

    if (ref.current !== null) {
      document.addEventListener("mousedown", handleClicksOutside);
    }

    return () => document.removeEventListener("mousedown", handleClicksOutside);
  }, [ref, handler]);
}
