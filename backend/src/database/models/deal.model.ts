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
import type { Contact } from "./contact.model.js";
import type { User } from "./user.model.js";

export type DealStage =
  | "new_interest"
  | "in_service"
  | "proposal_sent"
  | "waiting_customer"
  | "negotiation"
  | "won"
  | "lost";

export type DealStatus = "open" | "won" | "lost";

export class Deal extends Model<
  InferAttributes<Deal>,
  InferCreationAttributes<Deal>
> {
  declare id: CreationOptional<string>;
  declare companyId: ForeignKey<Company["id"]>;
  declare contactId: ForeignKey<Contact["id"]>;
  declare ownerId: ForeignKey<User["id"]> | null;
  declare stage: CreationOptional<DealStage>;
  declare title: string;
  declare destination: string | null;
  declare value: CreationOptional<number>;
  declare probability: CreationOptional<number>;
  declare nextAction: string | null;
  declare expectedCloseAt: Date | null;
  declare status: CreationOptional<DealStatus>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

export function initDealModel(sequelize: Sequelize) {
  Deal.init(
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
      contactId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      ownerId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      stage: {
        type: DataTypes.ENUM(
          "new_interest",
          "in_service",
          "proposal_sent",
          "waiting_customer",
          "negotiation",
          "won",
          "lost"
        ),
        allowNull: false,
        defaultValue: "new_interest"
      },
      title: {
        type: DataTypes.STRING(180),
        allowNull: false
      },
      destination: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      probability: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      nextAction: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      expectedCloseAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM("open", "won", "lost"),
        allowNull: false,
        defaultValue: "open"
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      deletedAt: DataTypes.DATE
    },
    {
      sequelize,
      tableName: "deals",
      paranoid: true,
      indexes: [
        { fields: ["companyId", "stage"] },
        { fields: ["companyId", "status"] },
        { fields: ["companyId", "contactId"] },
        { fields: ["companyId", "ownerId"] },
        { fields: ["companyId", "createdAt"] }
      ]
    }
  );
}
