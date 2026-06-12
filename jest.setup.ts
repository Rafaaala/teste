// jest.setup.ts — na raiz do projeto
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Fallbacks para variáveis obrigatórias que podem não existir no CI
process.env.DATABASE_URL      = process.env.DATABASE_URL      ?? 'postgresql://test:test@localhost/test'
process.env.MP_ACCESS_TOKEN   = process.env.MP_ACCESS_TOKEN   ?? 'APP_USR-fake-token-for-tests'
process.env.INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET ?? 'secret-de-teste'