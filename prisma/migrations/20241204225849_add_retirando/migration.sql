/*
  Warnings:

  - You are about to drop the `adicionais` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `imagens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `itens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `adicionais` DROP FOREIGN KEY `adicionais_orcamentoId_fkey`;

-- DropForeignKey
ALTER TABLE `imagens` DROP FOREIGN KEY `imagens_orcamentoId_fkey`;

-- DropForeignKey
ALTER TABLE `itens` DROP FOREIGN KEY `itens_orcamentoId_fkey`;

-- DropTable
DROP TABLE `adicionais`;

-- DropTable
DROP TABLE `imagens`;

-- DropTable
DROP TABLE `itens`;
