import esbuild from 'rollup-plugin-esbuild'
import resolve from '@rollup/plugin-node-resolve'
import css from 'rollup-plugin-import-css'
import svg from 'rollup-plugin-svg-import'
import commonjs from '@rollup/plugin-commonjs'

const browserConfig = {
  input: './index.tsx',
  output: [
    {
      dir: './build',
      format: 'cjs',
    },
  ],
  external: ['react'],
  plugins: [
    svg({ stringify: false }),
    css(),
    resolve({ preferBuiltins: true }),
    esbuild({
      include: /\.[jt]sx?$/, 
      exclude: /node_modules/, 
      sourceMap: false, 
      minify: process.env.NODE_ENV === 'production',
      target: 'es2017', 
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      define: {
        __VERSION__: '"x.y.z"',
      },
      tsconfig: 'tsconfig.json', 
      loaders: {
        '.json': 'json',
        '.js': 'jsx',
      },
    }),
  ],
}

const nodeConfig = {
  input: 'server/index.ts',
  output: [
    {
      dir: './build/server/',
      format: 'cjs',
    },
  ],
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    esbuild({
      include: /\.[jt]sx?$/, 
      exclude: /node_modules/, 
      sourceMap: false, 
      minify: process.env.NODE_ENV === 'production',
      target: 'node10', 
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      define: {
        __VERSION__: '"x.y.z"',
      },
      tsconfig: 'tsconfig.json', 
      loaders: {
        '.json': 'json',
        '.js': 'jsx',
      },
    }),
  ],
}

export default [browserConfig, nodeConfig]
