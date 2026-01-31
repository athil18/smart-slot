import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/db';
import { AppointmentStatus, APPOINTMENT_STATUS, Priority, PRIORITY } from '@smartslot/shared';

interface AppointmentAttributes {
    id: string;
    priority: Priority;
    notes?: string;
    status: AppointmentStatus;
    rescheduledFrom?: string;
    clientId?: string;
    slotId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface AppointmentCreationAttributes extends Optional<AppointmentAttributes, 'id' | 'priority' | 'status' | 'notes' | 'rescheduledFrom' | 'clientId' | 'slotId'> { }

class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
    public id!: string;
    public priority!: Priority;
    public notes?: string;
    public status!: AppointmentStatus;
    public rescheduledFrom?: string;
    public clientId!: string;
    public slotId!: string;
}

Appointment.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    priority: {
        type: DataTypes.ENUM(...Object.values(PRIORITY)),
        defaultValue: PRIORITY.NORMAL
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM(...Object.values(APPOINTMENT_STATUS)),
        defaultValue: APPOINTMENT_STATUS.CONFIRMED
    },
    rescheduledFrom: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Appointment'
});

export default Appointment;
