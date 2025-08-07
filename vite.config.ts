import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: { 
        minify: 'terser',
        outDir: 'dist',
        sourcemap: true,
        lib: {
            entry: 'src/index.ts',
            name: 'adac-api-client',
            fileName: (format: any) => `adac-api-client.${format}.js`,
            formats: ['es', 'umd']
        }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    plugins: [
        dts({
            tsconfigPath: './tsconfig.json',
            insertTypesEntry: true
        })
    ]
})
