import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    // Tests render iframes (article embeds); never let happy-dom fetch them.
    environmentOptions: {
      happyDOM: { settings: { disableIframePageLoading: true } },
    },
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'scripts/**/*'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/**',
        '.next/**',
        'scripts/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/types*.ts',
        '**/*.config.{ts,js,mjs}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
