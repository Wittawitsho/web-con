/*
  Warnings:

  - Added the required column `date` to the `Concert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Concert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Concert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `concert` ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `location` VARCHAR(191) NOT NULL,
    ADD COLUMN `time` VARCHAR(191) NOT NULL;
