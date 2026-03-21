/*
  Warnings:

  - You are about to drop the column `classificacaoEtaria` on the `Filme` table. All the data in the column will be lost.
  - Added the required column `classificacao` to the `Filme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataFinalExibicao` to the `Filme` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataIniciaExibicao` to the `Filme` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Filme" DROP COLUMN "classificacaoEtaria",
ADD COLUMN     "classificacao" TEXT NOT NULL,
ADD COLUMN     "dataFinalExibicao" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dataIniciaExibicao" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "elenco" TEXT,
ADD COLUMN     "sinopse" TEXT;
