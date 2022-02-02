import { spawn, ChildProcessWithoutNullStreams } from "child_process";

export function startSMServer(
  cwd: string,
  port: string,
  callback: (url: string) => void
) {
  const smServer: ChildProcessWithoutNullStreams = spawn(
    "node",
    ["../../server/src/index.js"],
    {
      cwd: __dirname,
      env: {
        ...process.env,
        CWD: cwd,
        PORT: port,
      },
    }
  );

  smServer.stdout.on("data", function (data: Buffer) {
    const lns = data.toString().split("Server running");
    if (lns.length === 2) {
      callback(lns[1].replace(/\\n/, "").trim());
    } else {
      console.log(data.toString());
    }
  });

  smServer.stderr.on("data", function (data: Buffer) {
    console.log("[slice-machine] " + data.toString());
  });
}
