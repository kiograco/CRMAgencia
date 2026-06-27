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

export type ContactStatus =
  | "very_hot"
  | "hot"
  | "warm"
  | "cold"
  | "lost"
  | "returning_customer"
  | "waiting_response";

export class Contact extends Model<
  InferAttributes<Contact>,
  InferCreationAttributes<Contact>
> {
  declare id: CreationOptional<string>;
  declare companyId: ForeignKey<Company["id"]>;
  declare name: string;
  declare email: string | null;
  declare phone: string | null;
  declare status: CreationOptional<ContactStatus>;
  declare score: CreationOptional<number>;
  declare interest: string | null;
  declare nextTrip: string | null;
  declare consultantId: ForeignKey<User["id"]> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export function initContactModel(sequelize: Sequelize) {
  Contact.init(
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
        allowNull: true,
        set(value: string | null) {
          this.setDataValue("email", value ? value.trim().toLowerCase() : null);
        }
      },
      phone: {
        type: DataTypes.STRING(40),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM(
          "very_hot",
          "hot",
          "warm",
          "cold",
          "lost",
          "returning_customer",
          "waiting_response"
        ),
        allowNull: false,
        defaultValue: "warm"
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      interest: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      nextTrip: {
        type: DataTypes.STRING(80),
        allowNull: true
      },
      consultantId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      deletedAt: DataTypes.DATE
    },
    {
      sequelize,
      tableName: "contacts",
      paranoid: true,
      indexes: [
        { fields: ["companyId", "status"] },
        { fields: ["companyId", "consultantId"] },
        { fields: ["companyId", "email"] },
        { fields: ["companyId", "createdAt"] }
      ]
    }
  );
}
