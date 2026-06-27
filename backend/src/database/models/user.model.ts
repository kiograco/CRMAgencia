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

export type UserRole = "owner" | "admin" | "manager" | "agent";
export type UserStatus = "active" | "inactive";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare companyId: ForeignKey<Company["id"]>;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare role: UserRole;
  declare status: UserStatus;
  declare lastLoginAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initUserModel(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      companyId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(180),
        allowNull: false,
        set(value: string) {
          this.setDataValue("email", value.trim().toLowerCase());
        }
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM("owner", "admin", "manager", "agent"),
        allowNull: false,
        defaultValue: "agent"
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active"
      },
      lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      sequelize,
      tableName: "users",
      indexes: [
        { unique: true, fields: ["companyId", "email"] },
        { fields: ["email"] },
        { fields: ["companyId", "status"] }
      ]
    }
  );
}
