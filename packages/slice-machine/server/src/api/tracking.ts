import { v4 as uuidv4 } from "uuid";
import {
  TrackingEvents,
  isTrackingEvent,
  isGroupLibrariesEvent,
  isIdentifyUserEvent,
} from "../../../lib/models/tracking";
import { RequestWithEnv } from "./http/common";
import * as analytics from "./services/analytics";
import { retrieveJsonPackage } from "@slicemachine/core/build/node-utils";
import path from "path";

const anonymousId = uuidv4();

const pathToPackage = path.resolve(__dirname, "..", "..", "..");
const pkg = retrieveJsonPackage(pathToPackage);
const version = pkg.content?.version ?? "";

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
        slicemachineVersion: version,
        nodeVersion: process.versions.node,
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
      properties: {
        ...event.props,
        slicemachineVersion: version,
        nodeVersion: process.versions.node,
      },
      ...(userId !== undefined ? { userId } : { anonymousId }),
      context: { groupId: { Repository: repositoryName } },
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
