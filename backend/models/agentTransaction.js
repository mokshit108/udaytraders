module.exports = (sequelize, DataTypes) => {
  const AgentTransaction = sequelize.define(
    "AgentTransaction",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      agent_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "agents", // The table this foreign key refers to
          key: "id",
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users", // Assuming you have a `users` table
          key: "id",
        },
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "orders", // Assuming you have an `orders` table
          key: "id",
        },
      },
      region: {
        type: DataTypes.STRING,
        allowNull: true, // Region can be null or empty
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
    },
    {
      tableName: "agent_transactions", // New table for agent transactions
      timestamps: false, // Disable automatic handling of timestamps
    }
  );

  // Associations: AgentTransaction belongs to an Agent, Order, and User
  AgentTransaction.belongsTo(sequelize.models.Agent, {
    foreignKey: "agent_id",
  });
  AgentTransaction.belongsTo(sequelize.models.User, { foreignKey: "user_id" });
  AgentTransaction.belongsTo(sequelize.models.Order, {
    foreignKey: "order_id",
  });

  return AgentTransaction;
};
