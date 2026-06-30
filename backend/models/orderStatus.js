module.exports = (sequelize, DataTypes) => {
    const OrderStatus = sequelize.define('OrderStatus', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
    }, {
      tableName: 'order_status',
      timestamps: false,
    });
  
    OrderStatus.associate = (models) => {
      OrderStatus.hasMany(models.Order, { foreignKey: 'status_id' });
    };
  
    return OrderStatus;
  };
  