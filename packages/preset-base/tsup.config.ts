import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src'],
  format: ['cjs', 'esm'],
  target: 'node12',
  splitting: false,
  clean: true,
  dts: false,
})