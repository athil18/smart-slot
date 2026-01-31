import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/db';

interface AuditLogAttributes {
    id: string;
    action: string;
    details?: any;
    timestamp: Date;
    performedById?: string;
}

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'details' | 'timestamp' | 'performedById'> { }

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
    public id!: string;
    public action!: string;
    public details?: any;
    public timestamp!: Date;
    public performedById?: string;
}

AuditLog.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'AuditLog'
});

export default AuditLog;
