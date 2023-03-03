import { v4 as uuidv4 } from "uuid";
import {
  TrackingEvents,
  isTrackingEvent,
  isGroupLibrariesEvent,
  isIdentifyUserEvent,
} from "../../../lib/models/tracking";
import { RequestWithEnv } from "./http/common";
import * as analytics from "./services/analytics";
import { version, name } from "../../../package.json";

const anonymousId = uuidv4();

const userAgent = `NodeJS/${process.versions.node}`;

export function sendEvents(
  event: TrackingEvents,
  repositoryName: string,
  userId?: string,
  intercomHash?: string
): void {
  if (isGroupLibrariesEvent(event)) {
    analytics.group({
      ...(userId !== undefined ? { userId } : { anonymousId }),
      groupId: event.props.repoName,
      traits: { ...event.props },
      context: {
        app: {
          name,
          version,
        },
        userAgent,
      },
    });
  } else if (isIdentifyUserEvent(event)) {
    if (userId !== undefined && intercomHash !== undefined) {
      analytics.identify({
        ...(userId ? { userId } : { anonymousId }),
        integrations: {
          Intercom: {
            user_hash: intercomHash,
          },
        },
      });
    }
  } else if (isTrackingEvent(event)) {
    analytics.track({
      event: event.name,
      properties: { ...event.props },
      ...(userId !== undefined ? { userId } : { anonymousId }),
      context: {
        app: {
          name,
          version,
        },
        userAgent,
        groupId: { Repository: repositoryName },
      },
    });
  }
}

export default async function handler(req: RequestWithEnv): Promise<void> {
  const data = req.body as TrackingEvents;
  const trackingEnabled =
    req.env.manifest.tracking === undefined || req.env.manifest.tracking;
  if (trackingEnabled) {
    sendEvents(
      data,
      req.env.repo,
      req.env.prismicData.shortId,
      req.env.prismicData.intercomHash
    );
  }

  return Promise.resolve();
}
