import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
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
