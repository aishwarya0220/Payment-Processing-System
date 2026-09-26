/*
  Warnings:

  - Made the column `idempotency_key` on table `Payments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Payments" ALTER COLUMN "amount" SET DATA TYPE TEXT,
ALTER COLUMN "idempotency_key" SET NOT NULL;
