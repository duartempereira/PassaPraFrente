import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js', 'tests/**/*.spec.js'],
    coverage: {
      all: true,
      include: ['./tests/**/*'],
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      coverageDir: './coverage'
    }
  }
})
