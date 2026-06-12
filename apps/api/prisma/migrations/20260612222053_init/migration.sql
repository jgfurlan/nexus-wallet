-- CreateEnum
CREATE TYPE "TokenSymbol" AS ENUM ('BRL', 'BTC', 'ETH');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('DEPOSIT', 'SWAP_IN', 'SWAP_OUT', 'SWAP_FEE', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'SWAP', 'WITHDRAWAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletBalance" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "token" "TokenSymbol" NOT NULL,
    "amount" DECIMAL(36,18) NOT NULL DEFAULT 0,

    CONSTRAINT "WalletBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "walletBalanceId" TEXT NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "delta" DECIMAL(36,18) NOT NULL,
    "balanceBefore" DECIMAL(36,18) NOT NULL,
    "balanceAfter" DECIMAL(36,18) NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "fromToken" "TokenSymbol",
    "toToken" "TokenSymbol",
    "fromAmount" DECIMAL(36,18),
    "toAmount" DECIMAL(36,18),
    "feeAmount" DECIMAL(36,18),
    "rate" DECIMAL(36,18),
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletBalance_walletId_token_key" ON "WalletBalance"("walletId", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_idempotencyKey_key" ON "Transaction"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletBalance" ADD CONSTRAINT "WalletBalance_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_walletBalanceId_fkey" FOREIGN KEY ("walletBalanceId") REFERENCES "WalletBalance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
