import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';


import { babel } from '@rollup/plugin-babel';

import pkg from './package.json';

export default [
	{
		input: 'src/index.js',
		output: [
      {
        file: pkg.unpkg,
        format: 'umd',
        name: 'NextSliceZone',
        globals: {
          react: 'React'
        }
      },
			{ file: pkg.main, format: 'cjs', globals: { react: 'React' } },
			{ file: pkg.module, format: 'es', globals: { react: 'React' } }
		],
    plugins: [
      peerDepsExternal(),
      resolve(),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                esmodules: true,
              },
            },
          ],
          '@babel/preset-react'
        ]
      }),
      commonjs(),
      terser()
    ]
	},
  {
		input: 'src/features/resolver/index.js',
		output: [
      {
        file: `resolver/index.umd.js`,
        format: 'umd',
        name: 'NextSliceZoneResolver'
      },
			{
			  file: `resolver/index.js`,
			  format: 'cjs'
			},
			{
			  file: `resolver/index.module.js`,
			  format: 'es'
			}
		],
    plugins: [
      peerDepsExternal(),
      resolve(),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                esmodules: true,
              },
            },
          ],
          '@babel/preset-react'
        ]
      }),
      commonjs(),
      terser()
    ]
	},
  {
    input: 'src/hooks/index.js',
    output: [{
        file: `hooks/index.umd.js`,
        format: 'umd',
        name: 'NextSliceZoneHooks'
      },
      {
        file: `hooks/index.js`,
        format: 'cjs'
      },
      {
        file: `hooks/index.module.js`,
        format: 'es'
      }
    ],
    plugins: [
      babel({
        babelHelpers: 'runtime',
        exclude: '**/node_modules/**',
        plugins: ['@babel/plugin-transform-runtime'],
        presets: ['@babel/env']
      }),
      terser()
    ],
  }
]