/*
  Warnings:

  - You are about to drop the column `itens` on the `LancheCombo` table. All the data in the column will be lost.
  - You are about to drop the column `preco` on the `LancheCombo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LancheCombo" DROP COLUMN "itens",
DROP COLUMN "preco",
ADD COLUMN     "qtUnidade" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "valorUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "qtInteira" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "qtMeia" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "valorTotal" DROP DEFAULT;
