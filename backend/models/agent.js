module.exports = (sequelize, DataTypes) => {
  const Agent = sequelize.define(
    "Agent",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      availability: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Default to available
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Ensure that the user_id is always present
        references: {
          model: 'users', // Reference the 'users' table
          key: 'id', // Reference the 'id' column in the 'users' table
        },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW, // Automatically update on record changes
      },
    },
    {
      tableName: "agents", // Ensure the table name matches the plural form
      timestamps: false, // Disable automatic handling of timestamps
    }
  );
  Agent.associate = (models) => {
    // Association: An agent can have many transactions (orders assigned)
    Agent.hasMany(sequelize.models.AgentTransaction, {
      foreignKey: "agent_id",
    });

    Agent.hasMany(sequelize.models.Order, { foreignKey: "agent_id" });

     // Association with the 'User' model (Agent belongs to User)
    Agent.belongsTo(sequelize.models.User, { foreignKey: "user_id" });

  };
  return Agent;
};
