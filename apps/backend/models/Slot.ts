import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/db';
import { SlotStatus, SLOT_STATUS } from '@smartslot/shared';

interface SlotAttributes {
    id: string;
    startTime: Date;
    endTime: Date;
    status: SlotStatus;
    isRecurring: boolean;
    staffId?: string;
    resourceId?: string;
}

interface SlotCreationAttributes extends Optional<SlotAttributes, 'id' | 'status' | 'isRecurring' | 'staffId' | 'resourceId'> { }

class Slot extends Model<SlotAttributes, SlotCreationAttributes> implements SlotAttributes {
    public id!: string;
    public startTime!: Date;
    public endTime!: Date;
    public status!: SlotStatus;
    public isRecurring!: boolean;
    public staffId!: string;
    public resourceId!: string;
}

Slot.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM(...Object.values(SLOT_STATUS)),
        defaultValue: SLOT_STATUS.AVAILABLE
    },
    isRecurring: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'Slot',
    validate: {
        endTimeAfterStartTime(this: Slot) {
            if (this.endTime <= this.startTime) {
                throw new Error('End time must be after start time');
            }
        }
    }
});

export default Slot;
