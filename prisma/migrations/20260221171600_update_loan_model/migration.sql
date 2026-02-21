/*
  Warnings:

  - You are about to drop the column `dataEmprestimo` on the `Loan` table. All the data in the column will be lost.
  - Added the required column `dataInicio` to the `Loan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "dataEmprestimo",
ADD COLUMN     "dataInicio" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ATIVO';
