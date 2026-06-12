import type { Config } from 'jest'
import dotenv          from 'dotenv'

// Carrega o .env.local antes de qualquer teste
dotenv.config({ path: '.env.local' })

const config: Config = {
  preset:          'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  // Define variáveis mínimas para os testes mesmo sem .env.local
  testEnvironmentOptions: {},
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  setupFiles: ['<rootDir>/jest.setup.ts'],
}

export default config