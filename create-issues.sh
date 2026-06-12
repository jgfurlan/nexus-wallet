#!/bin/bash
set -e

issues=(
  "Project scaffold (monorepo + Fastify + Prisma + DB schema):Set up the initial project scaffolding: monorepo using pnpm workspaces, Fastify server configuration, Prisma ORM schema and database models."
  "Auth module (register, login, JWT, refresh token):Implement the authentication module supporting registration, login, JWT issuance, and refresh token rotation."
  "Wallet module (auto-create on register, get balances):Implement the wallet module. Wallets should be auto-created on user registration, and endpoints should exist to retrieve balances."
  "Ledger module (append-only entries, audit endpoint):Implement the append-only ledger module for tracking transaction entries and audit verification."
  "Deposit webhook (idempotency, credit, error handling):Implement a secure deposit webhook with idempotency keys, crediting balances and proper error handling."
  "Swap module (quote endpoint + execute endpoint):Implement the token swap module with quote endpoints and execution logic."
  "Withdrawal module:Implement the withdrawal module for users to withdraw funds."
  "Transaction history endpoint (paginated):Implement paginated transaction history endpoint."
  "Redis cache for CoinGecko quotes (30s TTL):Implement Redis caching for CoinGecko coin quotes with a 30-second Time To Live (TTL)."
  "React frontend (dashboard, swap form, history):Build the React frontend interface including a dashboard, swap form, and transaction history."
  "Deploy: Railway (API) + Vercel (web):Configure deployment: deploy API backend on Railway and React frontend on Vercel."
  "README + technical decisions doc:Document the project details: README setup and a technical decisions document."
)

for issue in "${issues[@]}"; do
  title="${issue%%:*}"
  body="${issue#*:}"
  echo "Creating issue: $title"
  gh issue create --title "$title" --body "$body"
  sleep 1
done
