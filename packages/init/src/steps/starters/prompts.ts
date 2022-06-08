import inquirer from "inquirer";

export async function promptToPushSlices(): Promise<boolean> {
  return inquirer
    .prompt<{ pushSlices: boolean }>([
      {
        type: "confirm",
        name: "pushSlices",
        default: false,
        message:
          "Your repository already contains Slices. Do you want to continue pushing your local Slices?",
      },
    ])
    .then((res) => res.pushSlices);
}
