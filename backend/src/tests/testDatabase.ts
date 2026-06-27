import { Sequelize } from "sequelize";

export async function ensureTestDatabase() {
  const adminConnection = new Sequelize(
    "postgres://crm:crm@127.0.0.1:55432/postgres",
    { logging: false }
  );

  try {
    await adminConnection.query("CREATE DATABASE crm_test");
  } catch (error) {
    const code = (error as { original?: { code?: string } }).original?.code;
    if (code !== "42P04") {
      throw error;
    }
  } finally {
    await adminConnection.close();
  }
}
