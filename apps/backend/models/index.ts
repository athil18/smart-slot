import User from './User';
import Resource from './Resource';
import Slot from './Slot';
import Appointment from './Appointment';
import AuditLog from './AuditLog';

// User <-> Slot (Staff)
User.hasMany(Slot, { foreignKey: 'staffId', as: 'offeredSlots', onDelete: 'CASCADE' });
Slot.belongsTo(User, { foreignKey: 'staffId', as: 'staff' });

// Resource <-> Slot
Resource.hasMany(Slot, { foreignKey: 'resourceId', onDelete: 'SET NULL' });
Slot.belongsTo(Resource, { foreignKey: 'resourceId', as: 'resource' });

// User <-> Appointment (Client)
User.hasMany(Appointment, { foreignKey: 'clientId', as: 'bookings', onDelete: 'CASCADE' });
Appointment.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

// Slot <-> Appointment
Slot.hasOne(Appointment, { foreignKey: 'slotId', onDelete: 'CASCADE' });
Appointment.belongsTo(Slot, { foreignKey: 'slotId', as: 'slot' });

// User <-> AuditLog
User.hasMany(AuditLog, { foreignKey: 'performedById', onDelete: 'SET NULL' });
AuditLog.belongsTo(User, { foreignKey: 'performedById', as: 'performedBy' });

export {
    User,
    Resource,
    Slot,
    Appointment,
    AuditLog
};
