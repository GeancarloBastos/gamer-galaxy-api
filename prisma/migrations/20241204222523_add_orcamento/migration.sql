-- CreateTable
CREATE TABLE `orcamentos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(60) NOT NULL DEFAULT 'PENDENTE',
    `acabamento` VARCHAR(60) NOT NULL,
    `ambiente` VARCHAR(60) NOT NULL,
    `faixaPreco` VARCHAR(120) NOT NULL,
    `observacoes` VARCHAR(255) NOT NULL,
    `prazo` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orcamentos` ADD CONSTRAINT `orcamentos_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `clientes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
