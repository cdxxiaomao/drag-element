import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import * as path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts()
  ],
  server: {
    port: 5177
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      fileName: (format) => `index.${format}.js`,
      name: 'LibName'
    }
  }
})
