import { Errors } from "io-ts";

interface PathType {
  type: "index" | "path";
  value: string;
}

const ErrorsHandler = {
  report(errors: Errors): string {
    const invalidPaths: string = errors
      .map<{ value: unknown; formattedPath: string }>((error) => {
        const chunk = error.context
          .map(({ key }) => key)
          .filter((c) => c !== "");
        const computedChunks: PathType[] = chunk.map((c) => {
          const index = parseInt(c);
          if (isNaN(index)) {
            return {
              type: "path",
              value: c,
            } as PathType;
          } else {
            return {
              type: "index",
              value: index.toString(),
            } as PathType;
          }
        });

        const formattedPath = computedChunks.reduce(
          (acc: string, chunk: PathType) => {
            switch (chunk.type) {
              case "index":
                return acc + `|${chunk.value}|`;
              case "path":
                return acc + `/${chunk.value}`;
            }
          },
          ""
        );

        return { value: error.value, formattedPath };
      })
      .map(
        ({ value, formattedPath }) =>
          `\tPATH: ${formattedPath}\n\tVALUE: ${JSON.stringify(value)}`
      )
      .join("\n\n");

    return `Invalid Paths:\n  ${invalidPaths}`;
  },
};

export default ErrorsHandler;
