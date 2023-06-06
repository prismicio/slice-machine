import React from "react";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import * as styles from "./Logo.css";
import LogoIcon from "@src/icons/LogoIcon";
import OpenIcon from "@src/icons/OpenIcon";

function firstLetterToUpperCase(word: string): string {
  if (word === "") return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const Logo: React.FC = () => {
  // TODO: reuse selector from DT-1333
  const apiEndpoint = useSelector((state: SliceMachineStoreType) => {
    return state.environment.manifest.apiEndpoint;
  });

  const repoDomain = new URL(apiEndpoint).hostname.replace(".cdn", "");
  const maybeRepoName = /[^\.]*/.exec(repoDomain);
  const repoNameOrNull = maybeRepoName ? maybeRepoName[0] : "";

  const repoName = firstLetterToUpperCase(repoNameOrNull);

  const addr = apiEndpoint.replace(".cdn", "").replace("/api/v2", "");

  return (
    <div className={styles.container}>
      <LogoIcon className={styles.icon} />

      <div className={styles.flex}>
        <div>
          <h1 className={styles.title} data-no-base-style>
            {repoName}
          </h1>

          <h2 className={styles.repoUrl} data-no-base-style>
            {repoDomain}
          </h2>
        </div>

        <a href={addr} target="_blank" title="open prismic repository">
          <OpenIcon />
        </a>
      </div>
    </div>
  );
};

export default Logo;
