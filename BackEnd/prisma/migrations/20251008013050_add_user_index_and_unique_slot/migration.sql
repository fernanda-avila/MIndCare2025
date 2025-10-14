/*
  Warnings:

  - A unique constraint covering the columns `[professionalId,startAt,endAt]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Appointment_userId_startAt_idx" ON "Appointment"("userId", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_professionalId_startAt_endAt_key" ON "Appointment"("professionalId", "startAt", "endAt");
