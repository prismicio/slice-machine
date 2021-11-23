import Analytics from "analytics-node";
import { LibraryUI } from "./LibraryUI";

export default class Tracker {
  readonly analytics: Analytics;
  readonly slicemachineVersion: string;

  constructor(
    readonly key: string | undefined,
    readonly smVersion: string | undefined
  ) {
    if (!key) throw new Error("Missing write key for tracker.");

    this.analytics = new Analytics(key);
    this.slicemachineVersion = smVersion || "default"; //default will be logged if we can't parse package.json
  }

  Repository = (repo: string | void) => {
    if (!repo) return; // we can't track as long as we're not tied to a repo.

    return {
      libraries: (libs: readonly LibraryUI[]) => {
        this.analytics.group({
          userId: "",
          groupId: repo,
          traits: {
            manualLibsCount: libs.filter((l) => l.isLocal).length,
            downloadedLibsCount: libs.filter((l) => !l.isLocal).length,
            downloadedLibs: [],
            slicemachineVersion: this.slicemachineVersion,
          },
        });
      },
    };
  };
}
