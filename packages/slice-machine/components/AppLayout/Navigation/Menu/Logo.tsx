import React from "react";
import { useSelector } from "react-redux";
import { SliceMachineStoreType } from "@src/redux/type";
import * as styles from "./Logo.css";

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="32" height="32" rx="6" fill="#1A1523" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.2519 22.6786C19.7531 22.6786 22.5913 19.8404 22.5913 16.3393C22.5913 14.8061 22.0469 13.3999 21.141 12.3037L23.8238 10.7547C23.9923 10.6574 24.05 10.4421 23.9528 10.2736C23.8555 10.1052 23.6401 10.0474 23.4717 10.1447L20.65 11.7738C19.5101 10.6754 17.9599 10 16.2519 10C12.7508 10 9.91263 12.8382 9.91263 16.3393C9.91263 17.7073 10.3459 18.9741 11.0828 20.0099L8.17615 21.688C8.0077 21.7853 7.94999 22.0006 8.04724 22.1691C8.1445 22.3375 8.35989 22.3953 8.52834 22.298L11.5276 20.5664C12.6883 21.8628 14.3749 22.6786 16.2519 22.6786ZM11.5276 20.5664C11.3692 20.3895 11.2207 20.2038 11.0828 20.0099L17.3262 16.4052C17.4946 16.308 17.71 16.3657 17.8073 16.5341C17.9045 16.7026 17.8468 16.918 17.6784 17.0152L11.5276 20.5664ZM20.65 11.7738L14.3216 15.4275C14.1532 15.5247 14.0955 15.7401 14.1927 15.9086C14.29 16.077 14.5054 16.1347 14.6738 16.0375L21.141 12.3037C20.9874 12.1178 20.8235 11.9409 20.65 11.7738Z"
        fill="white"
      />
    </svg>
  );
};

const OpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.5 9C9.22386 9 9 9.22386 9 9.5V22.4996C9 22.7758 9.22386 22.9996 9.5 22.9996H22.5C22.7761 22.9996 23 22.7758 23 22.4996V17.5C23 17.2239 23.2239 17 23.5 17C23.7761 17 24 17.2239 24 17.5V22.4996C24 23.3281 23.3284 23.9996 22.5 23.9996H9.5C8.67157 23.9996 8 23.3281 8 22.4996V9.5C8 8.67157 8.67157 8 9.5 8H14.5C14.7761 8 15 8.22386 15 8.5C15 8.77614 14.7761 9 14.5 9H9.5ZM24 8H18L20.6464 10.6464L15.6464 15.6464C15.4512 15.8417 15.4512 16.1583 15.6464 16.3536C15.8417 16.5488 16.1583 16.5488 16.3536 16.3536L21.3536 11.3536L24 14V8Z"
        fill="#6F6E77"
      />
    </svg>
  );
};

function capataliseFirstLetter(word: string | null): string | null {
  if (word === null || word === "") return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

const Logo: React.FC = () => {
  // TODO: reuse selector from DT-1333
  const apiEndpoint = useSelector((state: SliceMachineStoreType) => {
    return state.environment.manifest.apiEndpoint;
  });

  const repoDomain = new URL(apiEndpoint).hostname.replace(".cdn", "");
  const maybeRepoName = /[^\.]*/.exec(repoDomain);
  const repoNameOrNull = maybeRepoName ? maybeRepoName[0] : null;

  const repoName = capataliseFirstLetter(repoNameOrNull);

  const addr = apiEndpoint.replace(".cdn", "").replace("/api/v2", "");

  return (
    <div className={styles.container}>
      <LogoIcon className={styles.icon} />

      <div className={styles.flex}>
        <div>
          <h1 style={styles.title}>{repoName}</h1>

          <h6 style={styles.repoUrl}>{repoDomain}</h6>
        </div>

        <a href={addr} target="_blank" title="open prismic repository">
          <OpenIcon />
        </a>
      </div>
    </div>
  );
};

export default Logo;
