/*
  Warnings:

  - You are about to drop the column `TicketId` on the `image` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `image` DROP FOREIGN KEY `Image_TicketId_fkey`;

-- AlterTable
ALTER TABLE `image` DROP COLUMN `TicketId`;
