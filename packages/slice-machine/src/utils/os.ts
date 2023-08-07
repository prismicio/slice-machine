export enum OS {
  Windows = "Windows",
  Macintosh = "Macintosh",
  Linux = "Linux",
}

export const getOS = () => {
  const { userAgent } = navigator;
  let os = OS.Macintosh;
  Object.values(OS).forEach((osValue) => {
    if (userAgent.includes(osValue)) {
      os = osValue;
    }
  });
  return os;
};
