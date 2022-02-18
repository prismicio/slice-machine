import dedent from "dedent";
import boxen from "boxen";

export default function infoBox(
  currentVersion: string,
  port: string,
  framework: string,
  userEmail?: string
) {
  if (!currentVersion) {
    console.error("Could not get your current package versions.");
    return;
  }

  console.log(
    boxen(
      dedent(`🍕 SliceMachine ${currentVersion.split("-")[0]} started.
        Framework:         ${framework}
        Logged in as:      ${userEmail || "Not logged in"}
        Running on:        ${port}

      👇 Server logs will appear right here
      `),
      {
        padding: 1,
        borderColor: "green",
      }
    )
  );
}
