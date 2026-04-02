/*
  Warnings:

  - You are about to drop the `_LancheComboToPedido` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LancheComboToPedido" DROP CONSTRAINT "_LancheComboToPedido_A_fkey";

-- DropForeignKey
ALTER TABLE "_LancheComboToPedido" DROP CONSTRAINT "_LancheComboToPedido_B_fkey";

-- DropTable
DROP TABLE "_LancheComboToPedido";

-- CreateTable
CREATE TABLE "ItemPedidoLanche" (
    "id" SERIAL NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "pedidoId" INTEGER NOT NULL,
    "lancheId" INTEGER NOT NULL,

    CONSTRAINT "ItemPedidoLanche_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemPedidoLanche" ADD CONSTRAINT "ItemPedidoLanche_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedidoLanche" ADD CONSTRAINT "ItemPedidoLanche_lancheId_fkey" FOREIGN KEY ("lancheId") REFERENCES "LancheCombo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
