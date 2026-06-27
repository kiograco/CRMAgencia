import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize
} from "sequelize";
import type { Company } from "./company.model.js";
import type { User } from "./user.model.js";

export class AuditLog extends Model<
  InferAttributes<AuditLog>,
  InferCreationAttributes<AuditLog>
> {
  declare id: CreationOptional<string>;
  declare companyId: ForeignKey<Company["id"]> | null;
  declare userId: ForeignKey<User["id"]> | null;
  declare action: string;
  declare entity: string;
  declare entityId: string | null;
  declare metadata: Record<string, unknown> | null;
  declare ipAddress: string | null;
  declare userAgent: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initAuditLogModel(sequelize: Sequelize) {
  AuditLog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      companyId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      action: {
        type: DataTypes.STRING(80),
        allowNull: false
      },
      entity: {
        type: DataTypes.STRING(80),
        allowNull: false
      },
      entityId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      ipAddress: {
        type: DataTypes.STRING(80),
        allowNull: true
      },
      userAgent: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      sequelize,
      tableName: "audit_logs",
      indexes: [
        { fields: ["companyId", "createdAt"] },
        { fields: ["userId", "createdAt"] },
        { fields: ["action"] }
      ]
    }
  );
}
