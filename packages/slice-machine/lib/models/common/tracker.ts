import Analytics from "analytics-node";
import { LibraryUI } from "./LibraryUI";

export interface TrackerOptions {
  flushAt?: number | undefined;
  flushInterval?: number | undefined;
  host?: string | undefined;
  enable?: boolean | undefined;
  timeout?: number | string | undefined;
}

// the default tracker should do nothing if parts are missing, it's a placeholder to prevent runtime errors in the meantime
const DEFAULT_TRACKER: Tracker = {
  libraries() {},
  resolveUser: () => {},
};

export class TrackerBuilder {
  readonly analytics: Analytics;
  readonly slicemachineVersion: string;

  constructor(
    readonly key: string | undefined,
    readonly smVersion: string | undefined,
    readonly credentials: {
      readonly userId?: string | undefined;
      readonly anonymousId?: string | undefined;
    },
    readonly repo: string | undefined,
    readonly options: TrackerOptions
  ) {
    if (!key) throw new Error("Missing write key for tracker.");
    console.log({ credentials });

    this.analytics = new Analytics(key, this.options);
    this.slicemachineVersion = smVersion || "default"; //default will be logged if we can't parse package.json
  }

  build: () => Tracker = () => {
    //TODO: see how we should handle these cases
    if (
      (!this.credentials.userId && !this.credentials.anonymousId) || // no one is authenticated and segment hasn't set an anonymousId yet.
      !this.repo // we can't track as long as we're not tied to a repo.
    )
      return DEFAULT_TRACKER;

    const validRepo = this.repo;

    return {
      resolveUser: (userId: string, anonymousId?: string | undefined) => {
        if (!anonymousId) {
          console.log("Missing anonymousId, Unable to resolve user session.");
          return;
        }
        this.analytics.alias({
          userId,
          previousId: anonymousId,
        });
      },

      libraries: (libs: readonly LibraryUI[]) => {
        const downloadedLibs = libs.filter((l) => l.meta.isDownloaded);

        this.analytics.group(
          {
            ...(this.credentials.userId
              ? { userId: this.credentials.userId }
              : {}),
            ...(this.credentials.anonymousId
              ? { anonymousId: this.credentials.anonymousId }
              : {}),
            groupId: validRepo,
            traits: {
              manualLibsCount: libs.filter((l) => l.meta.isManual).length,
              downloadedLibsCount: downloadedLibs.length,
              npmLibsCount: libs.filter((l) => l.meta.isNodeModule).length,
              downloadedLibs: downloadedLibs.map(
                (l) => l.meta.displayName || "Unknown"
              ),
              slicemachineVersion: this.slicemachineVersion,
            },
          },
          (err: any, data?: unknown) => {
            console.log({ err, data: JSON.stringify(data) });
          }
        );
      },
    };
  };
}

export interface Tracker {
  libraries: (libs: readonly LibraryUI[]) => void;
  resolveUser: (userId: string, anonymousId?: string | undefined) => void;
}
