import Analytics from "analytics-node";
import { v4 as uuidv4 } from "uuid";

import {
  TrackingEvents,
  isTrackingEvent,
  isGroupLibrariesEvent,
  isIdentifyUserEvent,
} from "../../../src/tracking/types";
import { RequestWithEnv } from "./http/common";

const anonymousId = uuidv4();

export function sendEvents(
  analytics: Analytics,
  event: TrackingEvents,
  repositoryName: string,
  userId?: string,
  intercomHash?: string
): void {
  if (isGroupLibrariesEvent(event)) {
    analytics.group({ groupId: event.props.repoName, traits: event.props });
  } else if (isIdentifyUserEvent(event) && userId && intercomHash) {
    analytics.identify({
      userId,
      anonymousId,
      integrations: {
        Intercom: {
          user_hash: intercomHash,
        },
      },
    });
  } else if (isTrackingEvent(event)) {
    analytics.track({
      event: event.name,
      properties: event.props,
      ...(userId ? { userId } : { anonymousId }),
      context: { groupId: { Repository: repositoryName } },
    });
  }
}

export default async function handler(req: RequestWithEnv): Promise<void> {
  const data = req.body as TrackingEvents;
  if (isTrackingEvent(data)) {
    const analytics = new Analytics("YOUR_WRITE_KEY");
    sendEvents(
      analytics,
      data,
      req.env.repo,
      req.env.prismicData.shortId,
      req.env.prismicData.intercomHash
    );
  }

  return Promise.resolve();
}
