import { Text } from "@prismicio/editor-ui";
import type { FC } from "react";

type RelativeTimeProps = {
  date: Date;
};

export const RelativeTime: FC<RelativeTimeProps> = ({
  date,
  ...otherProps
}) => (
  <Text {...otherProps} color="inherit" variant="inherit">
    {formatRelativeTime(date)}
  </Text>
);

const rtf = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
  style: "narrow",
});

function formatRelativeTime(date: Date, now = new Date()): string {
  return rtf.format(differenceInCalendarDays(date, now), "day");
}

const millisecondsInDay = 1_000 * 60 * 60 * 24;

// Adapted from: https://github.com/date-fns/date-fns/blob/6f44a167e71053999c10aa9462d7f0c52fec0faa/src/differenceInCalendarDays/index.ts.
function differenceInCalendarDays(dateLeft: Date, dateRight: Date): number {
  const startOfDayLeft = startOfDay(dateLeft);
  const startOfDayRight = startOfDay(dateRight);
  return Math.round((+startOfDayLeft - +startOfDayRight) / millisecondsInDay);
}

// Adapted from: https://github.com/date-fns/date-fns/blob/6f44a167e71053999c10aa9462d7f0c52fec0faa/src/startOfDay/index.ts.
function startOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}
