import { Appointment, AppointmentRepository } from '../domain/entities';

export class AgendaUseCases {
    constructor(private repository: AppointmentRepository) { }

    async getDailyAppointments(date: Date, userId?: string) {
        return await this.repository.findAllByDate(date, userId);
    }

    async getUserAppointments(userId: string) {
        return await this.repository.findAllByUser(userId);
    }

    async scheduleAppointment(data: Appointment) {
        return await this.repository.create(data);
    }

    async rescheduleAppointment(id: string, data: Partial<Appointment>) {
        return await this.repository.update(id, data);
    }

    async cancelAppointment(id: string) {
        return await this.repository.delete(id);
    }
}
