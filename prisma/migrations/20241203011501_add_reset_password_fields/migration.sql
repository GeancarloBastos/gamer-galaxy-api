-- AlterTable
ALTER TABLE `clientes` ADD COLUMN `resetToken` VARCHAR(64) NULL,
    ADD COLUMN `resetTokenExpiresAt` DATETIME(3) NULL;
