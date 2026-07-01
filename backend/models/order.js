module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
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
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      address_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "addresses",
          key: "id",
        },
      },
      status_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "order_status",
          key: "id",
        },
      },
      order_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [12, 12], // Ensure it's exactly 12 characters long
        },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      shipping_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      delivery_date: {
        type: DataTypes.DATE,
        allowNull: false, 
      },

    },
    {
      tableName: "orders",
      timestamps: false,
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: "user_id" });
    Order.belongsTo(models.Address, { foreignKey: "address_id" });
    Order.belongsTo(models.OrderStatus, { foreignKey: "status_id" });
    Order.hasMany(models.OrderItem, { foreignKey: "order_id" });
  };

  return Order;
};
