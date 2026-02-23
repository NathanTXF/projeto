-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "destinatarioId" TEXT,
ADD COLUMN     "visibilidade" TEXT NOT NULL DEFAULT 'PRIVADO';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "vendedorId" TEXT;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
