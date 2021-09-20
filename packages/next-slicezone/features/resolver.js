import fs from "fs";
import path from "path";

const registryLine = ([componentName, value]) => {
  const { isDirectory, pathToSlice, extension, fileName } = value;
  const directoryPath = isDirectory
    ? `${componentName}/${fileName}`
    : componentName;
  return `${componentName}: () => dynamic(() => import('${pathToSlice}/${directoryPath}.${extension}')),`;
};
const createFile = (registry) =>
  `
import dynamic from 'next/dynamic';
export default ({ sliceName }) => {
 const component = (sliceName) => ({
  ${Object.entries(registry).map(registryLine).join("\n\t")}
 })[sliceName]
 return component(sliceName)()
}
`;

export function create(registry, fileName = "sm-resolver.js") {
  const file = createFile(registry);
  return fs.writeFileSync(path.join(process.cwd(), fileName), file);
}
