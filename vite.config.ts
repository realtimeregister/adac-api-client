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
    plugins: [
        dts({
            tsconfigPath: './tsconfig.json',
            insertTypesEntry: true
        })
    ]
})
