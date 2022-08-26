import Analytics from "analytics-node";

const analytics = new Analytics(process.env.PUBLIC_SM_UI_SEGMENT_KEY || "", {
  // @ts-expect-error: @types/analytics-node not covering the property errorHandler yet.
  errorHandler: () => {
    /* Not blocking the code if event fails */
  },
});

export const track = analytics.track.bind(analytics);
export const group = analytics.group.bind(analytics);
export const identify = analytics.identify.bind(analytics);
