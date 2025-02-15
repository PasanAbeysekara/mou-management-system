-- AlterTable
ALTER TABLE `organization` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `lat` DOUBLE NULL,
    ADD COLUMN `lng` DOUBLE NULL;
