-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'LEGAL_ADMIN', 'FACULTY_ADMIN', 'SENATE_ADMIN', 'UGC_ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'USER',
    `department` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `addedBy` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mou_submissions` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `partnerOrganization` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `dateSubmitted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `datesSigned` DATETIME(3) NULL,
    `validUntil` DATETIME(3) NOT NULL,
    `submittedBy` VARCHAR(191) NOT NULL,
    `status` JSON NOT NULL,
    `documents` JSON NOT NULL,
    `renewalOf` VARCHAR(191) NULL,
    `history` JSON NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `mou_submissions_renewalOf_key`(`renewalOf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `mouId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `read` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mou_submissions` ADD CONSTRAINT `mou_submissions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mou_submissions` ADD CONSTRAINT `mou_submissions_renewalOf_fkey` FOREIGN KEY (`renewalOf`) REFERENCES `mou_submissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
