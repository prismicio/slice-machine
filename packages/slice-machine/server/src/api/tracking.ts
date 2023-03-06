import { v4 as uuidv4 } from "uuid";
import {
  TrackingEvents,
  isTrackingEvent,
  isGroupLibrariesEvent,
  isIdentifyUserEvent,
  EventNames,
} from "../../../lib/models/tracking";
import { RequestWithEnv } from "./http/common";
import * as analytics from "./services/analytics";
import { version, name } from "../../../package.json";

const anonymousId = uuidv4();

const nodeVersion = process.versions.node;

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
      traits: {
        ...event.props,
      },
      context: {
        app: {
          name,
          version,
        },
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
        context: {
          app: {
            name,
            version,
          },
        },
      });
    }
  } else if (isTrackingEvent(event)) {
    /*
     * We are adding the node version to get a sense of which version our users uses.
     * We add it to the event PageView as this is the most common one that everyone would trigger naturally.
     * We add this value back-end as it is way easier to retrieve here and we don't want to have it in the front-end as it is just used here.
     */
    const maybeNodeVersion =
      event.name === EventNames.PageView ? { nodeVersion } : {};

    analytics.track({
      event: event.name,
      properties: {
        ...event.props,
        ...maybeNodeVersion,
      },
      ...(userId !== undefined ? { userId } : { anonymousId }),
      context: {
        app: {
          name,
          version,
        },
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
