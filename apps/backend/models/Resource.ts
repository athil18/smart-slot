import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/db';
import { ResourceType, RESOURCE_TYPE } from '@smartslot/shared';

interface ResourceAttributes {
    id: string;
    name: string;
    type: ResourceType;
    capacity: number;
    status: 'available' | 'maintenance' | 'out_of_service';
}

interface ResourceCreationAttributes extends Optional<ResourceAttributes, 'id' | 'type' | 'capacity' | 'status'> { }

class Resource extends Model<ResourceAttributes, ResourceCreationAttributes> implements ResourceAttributes {
    public id!: string;
    public name!: string;
    public type!: ResourceType;
    public capacity!: number;
    public status!: 'available' | 'maintenance' | 'out_of_service';
}

Resource.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM(...Object.values(RESOURCE_TYPE)),
        defaultValue: RESOURCE_TYPE.ROOM
    },
    capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    status: {
        type: DataTypes.ENUM('available', 'maintenance', 'out_of_service'),
        defaultValue: 'available'
    }
}, {
    sequelize,
    modelName: 'Resource'
});

export default Resource;
