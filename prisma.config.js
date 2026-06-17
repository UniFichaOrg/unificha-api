import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
      // URL principal (com pooler/pgbouncer para a API)
      url: process.env.DATABASE_URL,

      // URL direta (essencial para o Supabase aceitar os comandos do npx prisma migrate)
      directUrl: process.env.DIRECT_URL,
  },
  generators: [
    {
      name: 'client',
      provider: 'prisma-client',
      output: './src/generated/prisma',
    },
  ],
    migrations: {
        seed: 'node ./prisma/seed.js',
    },
});
