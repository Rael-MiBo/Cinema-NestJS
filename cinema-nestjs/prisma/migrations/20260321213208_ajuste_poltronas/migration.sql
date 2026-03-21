-- DropIndex
DROP INDEX "Sala_numero_key";

-- AlterTable
ALTER TABLE "Ingresso" ADD COLUMN     "assento" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fila" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Sala" ADD COLUMN     "poltronas" JSONB NOT NULL DEFAULT '[]';
