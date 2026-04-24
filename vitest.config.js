import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'react',
    },
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['tests/**/*.test.{js,jsx}'],
        setupFiles: ['./src/frontend/src/setupTests.js'],
        css: false,
    },
})
