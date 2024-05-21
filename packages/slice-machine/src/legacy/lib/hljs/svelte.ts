/**
 * Adapted from https://github.com/AlexxNB/highlightjs-svelte/
 *
 * MIT License
 *
 * Copyright (c) 2019 Alexey Schebelev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { HLJSApi } from "highlight.js";

export const svelte = (hljs: HLJSApi) => {
  return {
    subLanguage: "xml",
    contains: [
      hljs.COMMENT("<!--", "-->", {
        relevance: 10,
      }),
      {
        begin: /^(\s*)(<script(\s*context="module")?>)/gm,
        end: /^(\s*)(<\/script>)/gm,
        subLanguage: "javascript",
        excludeBegin: true,
        excludeEnd: true,
        contains: [
          {
            begin: /^(\s*)(\$:)/gm,
            end: /(\s*)/gm,
            className: "keyword",
          },
        ],
      },
      {
        begin: /^(\s*)(<style.*>)/gm,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "css",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /\{/gm,
        end: /\}/gm,
        subLanguage: "javascript",
        contains: [
          {
            begin: /[\{]/,
            end: /[\}]/,
            skip: true,
          },
          {
            begin: /([#:\/@])(if|else|each|await|then|catch|debug|html)/gm,
            className: "keyword",
            relevance: 10,
          },
        ],
      },
    ],
  };
};
