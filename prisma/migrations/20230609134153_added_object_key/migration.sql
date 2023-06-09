/*
  Warnings:

  - Added the required column `objectKey` to the `Memory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Memory" ADD COLUMN     "objectKey" TEXT NOT NULL;
