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
        alias: {
            '@testing-library/react': path.resolve(__dirname, 'src/frontend/node_modules/@testing-library/react'),
            '@testing-library/jest-dom': path.resolve(__dirname, 'src/frontend/node_modules/@testing-library/jest-dom'),
            '@testing-library/dom': path.resolve(__dirname, 'src/frontend/node_modules/@testing-library/dom'),
            'react': path.resolve(__dirname, 'src/frontend/node_modules/react'),
            'react-dom': path.resolve(__dirname, 'src/frontend/node_modules/react-dom'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['tests/**/*.test.{js,jsx}'],
        setupFiles: ['./src/frontend/src/setupTests.js'],
        css: false,
    },
})
