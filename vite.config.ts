import { fileURLToPath, URL } from 'node:url'
import { BuildOptions, defineConfig, UserConfig } from 'vite'

import dts from 'vite-plugin-dts'
import vue from '@vitejs/plugin-vue'

const apps: Record<string, string> = {
    playground: './apps/playground',
    pricingExample: './apps/examples/pricing'
}
const appName: keyof typeof apps | undefined = process.env.APP_NAME

export default defineConfig((): UserConfig => {

    const alias: Record<string, string> = {
        '@': fileURLToPath(new URL('./src', import.meta.url))
    }

    const root: string | undefined = appName ? apps[appName] : undefined
    const build: BuildOptions | undefined = appName
      ? undefined
      : {
          minify: 'terser',
          outDir: 'dist',
          sourcemap: true,
          lib: {
              entry: 'src/index.ts',
              name: 'adac-api-client',
              fileName: (format: string): string => `adac-api-client.${format}.js`,
              formats: ['es', 'umd']
          }
      }

    return {
      resolve: { alias },
      plugins: [
          vue(),
          ...(build ? [
            dts(
              {
                  tsconfigPath: './tsconfig.json',
                  insertTypesEntry: true
              }
            )
          ] : [])
      ],
      root,
      build
    }
})
