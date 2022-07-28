import Analytics from "analytics-node";

const analytics = new Analytics(
  process.env.NEXT_PUBLIC_SM_UI_SEGMENT_KEY || ""
);

export const track = analytics.track.bind(analytics);
export const group = analytics.group.bind(analytics);
export const identify = analytics.identify.bind(analytics);
