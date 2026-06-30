module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      order_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      o_id: { // Reference to the order id in the Order table
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      final_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00, // Default value in case no discount is applied
      },
      discount_percentage: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING,
      },
      transaction_id: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "payments",
      timestamps: false,
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, { foreignKey: "o_id" });
    Payment.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return Payment;
};
