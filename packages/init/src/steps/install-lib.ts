import { Utils } from "@slicemachine/core";
import tmp from "tmp";
import AdmZip from "adm-zip";
import fsExtra from "fs-extra";
import axios from "axios";

import fs from "fs";
import path from "path";

const downloadFile = async (reqUrl: string): Promise<string> => {
  const res = await axios({
    method: "GET",
    url: reqUrl,
    responseType: "arraybuffer",
  });

  return new Promise((resolve, reject) => {
    if (res.status == 200) {
      const tmpZipFile = tmp.tmpNameSync();
      const zip = new AdmZip(res.data);
      zip.extractAllTo(tmpZipFile);
      resolve(tmpZipFile);
    } else {
      reject();
    }
  });
};

export async function installLib(libGithubPath: string): Promise<string[]> {
  const spinner = Utils.spinner(
    `Installing the ${libGithubPath} lib in your project...`
  );

  try {
    spinner.start();

    // How to handle vs main/master ?
    const mainBranchName = "main";
    const source = `https://codeload.github.com/${libGithubPath}/zip/${mainBranchName}`;

    const zipFilePath = await downloadFile(source);
    const projectPath = path.join(
      zipFilePath,
      `${libGithubPath.split("/")[1]}-${mainBranchName}`
    );

    // Which name we want to use for the lib ?
    const pathToPkg = path.join(projectPath, "package.json");
    const packageFile: { name?: string } = JSON.parse(
      fs.readFileSync(pathToPkg, "utf-8")
    ) as { name?: string };

    if (!packageFile.name) {
      spinner.fail(`Error installing ${libGithubPath} lib!`);
      process.exit(-1);
    }

    const name = packageFile.name;

    // We copy all the slices into the the user project
    fsExtra.moveSync(
      path.join(projectPath, "src"),
      path.join(process.cwd(), name)
    );

    spinner.succeed(`Slice library "${libGithubPath}" installed!`);

    // If the libs have multiple slice libs here we are grouping them into one
    return [`~/${name}/slices`];
  } catch (e) {
    spinner.fail(`Error installing ${libGithubPath} lib!`);
    process.exit(-1);

    return [];
  }
}
