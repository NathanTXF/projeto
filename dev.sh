#!/bin/bash
docker run --rm --name projeto-app-dev --network projeto_default \
  -v "$(pwd):/app" -w /app \
  -e DATABASE_URL=postgresql://admin:admin@db:5432/dinheiro_facil?schema=public \
  -p 3000:3000 \
  node:20 bash -c "npm install && chmod -R +x node_modules/.bin && npx prisma generate && npx prisma migrate dev --name init && npm run dev"
