import { sequelize } from "../sequelize.js";
import { AuditLog, initAuditLogModel } from "./audit-log.model.js";
import { Company, initCompanyModel } from "./company.model.js";
import { Contact, initContactModel } from "./contact.model.js";
import { initUserModel, User } from "./user.model.js";

let initialized = false;

export function initializeModels() {
  if (initialized) {
    return;
  }

  initCompanyModel(sequelize);
  initUserModel(sequelize);
  initContactModel(sequelize);
  initAuditLogModel(sequelize);

  Company.hasMany(User, {
    foreignKey: "companyId",
    as: "users"
  });
  User.belongsTo(Company, {
    foreignKey: "companyId",
    as: "company"
  });

  Company.hasMany(Contact, {
    foreignKey: "companyId",
    as: "contacts"
  });
  Contact.belongsTo(Company, {
    foreignKey: "companyId",
    as: "company"
  });
  User.hasMany(Contact, {
    foreignKey: "consultantId",
    as: "contacts"
  });
  Contact.belongsTo(User, {
    foreignKey: "consultantId",
    as: "consultant"
  });

  Company.hasMany(AuditLog, {
    foreignKey: "companyId",
    as: "auditLogs"
  });
  User.hasMany(AuditLog, {
    foreignKey: "userId",
    as: "auditLogs"
  });
  AuditLog.belongsTo(Company, {
    foreignKey: "companyId",
    as: "company"
  });
  AuditLog.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
  });

  initialized = true;
}

initializeModels();

export { AuditLog, Company, Contact, User };
