import { defineSirocConfig } from "siroc";
import replace from "@rollup/plugin-replace";

export default defineSirocConfig({
  rollup: {
    output: {
      sourcemap: true,
    },
    plugins: [
      replace({
        "process.env.NEXT_PUBLIC_SEGMENT_KEY": `"${
          process.env.NEXT_PUBLIC_SEGMENT_KEY ||
          "JfTfmHaATChc4xueS7RcCBsixI71dJIJ"
        }"`,
        preventAssignment: true,
      }),
    ],
  },
});
