import * as Tabs from "@radix-ui/react-tabs";
import * as styles from "./Window.css";
import { FC, HTMLAttributes, PropsWithChildren, SVGProps } from "react";

type DivProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export const Window: FC<DivProps> = (props) => (
  <div {...props} className={styles.root} />
);

export const WindowFrame: FC<DivProps> = (props) => (
  <div {...props} className={styles.frame} />
);

export const WindowFrameDots: FC<DivProps> = (props) => (
  <div className={styles.frameIconContainer} {...props}>
    <HorozontalThreeDotsIcon />
  </div>
);

const HorozontalThreeDotsIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="49"
    height="12"
    viewBox="0 0 49 12"
    className={styles.frameIcon}
    {...props}
  >
    <circle cx="5.5" cy="6" r="5.5" />
    <circle cx="24.5" cy="6" r="5.5" />
    <circle cx="43.5" cy="6" r="5.5" />
  </svg>
);

const VerticalThreeDotsIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    {...props}
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M15 11C15 10.4477 15.4477 10 16 10C16.5523 10 17 10.4477 17 11C17 11.5523 16.5523 12 16 12C15.4477 12 15 11.5523 15 11ZM15 16C15 15.4477 15.4477 15 16 15C16.5523 15 17 15.4477 17 16C17 16.5523 16.5523 17 16 17C15.4477 17 15 16.5523 15 16ZM16 20C15.4477 20 15 20.4477 15 21C15 21.5523 15.4477 22 16 22C16.5523 22 17 21.5523 17 21C17 20.4477 16.5523 20 16 20Z"
    />
  </svg>
);

export const WindowTabs: FC<Tabs.TabsProps> = (props) => (
  <Tabs.Root {...props} className={styles.tabs} />
);

export const WindowTabsList: FC<Tabs.TabsListProps> = (props) => (
  <Tabs.List {...props} className={styles.list} />
);

export const WindowTabsTrigger: FC<Tabs.TabsTriggerProps> = (props) => (
  <Tabs.Trigger {...props} className={styles.trigger}>
    {props.children}
    <VerticalThreeDotsIcon className={styles.triggerIcon} />
  </Tabs.Trigger>
);

export const WindowTabsContent: FC<Tabs.TabsContentProps> = (props) => (
  <Tabs.Content {...props} className={styles.content} />
);
