export enum OS {
  Mac = "Mac",
  Linux = "Linux",
  Windows = "Windows",
}

export const getOS = () => {
  const { userAgent } = navigator;
  let os = OS.Linux;
  Object.values(OS).forEach((osValue) => {
    if (userAgent.includes(osValue)) {
      os = osValue;
    }
  });
  return os;
};
