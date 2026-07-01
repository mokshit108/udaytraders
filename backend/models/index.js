const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

// Import models
const User = require('./user')(sequelize, Sequelize.DataTypes);

const Order = require('./order')(sequelize, Sequelize.DataTypes);
const OrderItem = require('./orderItem')(sequelize, Sequelize.DataTypes);
const Product = require('./product')(sequelize, Sequelize.DataTypes);
const Category = require('./category')(sequelize, Sequelize.DataTypes);
const Company = require('./company')(sequelize, Sequelize.DataTypes);
const Address = require('./address')(sequelize, Sequelize.DataTypes);

const OrderStatus = require('./orderStatus')(sequelize, Sequelize.DataTypes);

const Role = require('./role')(sequelize, Sequelize.DataTypes); // New Role model
const Footer = require('./footer')(sequelize, Sequelize.DataTypes); // New Role model

// Define relationships if needed
// User & Role Relationship
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' }); // Users now have a role_id foreign key

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.belongsTo(Category, { foreignKey: 'category_id', onDelete: 'CASCADE' });
Category.hasMany(Product, { foreignKey: 'category_id', onDelete: 'CASCADE' });

Product.belongsTo(Company, { foreignKey: 'company_id', onDelete: 'CASCADE' });
Company.hasMany(Product, { foreignKey: 'company_id', onDelete: 'CASCADE' });

Order.belongsTo(Address, { foreignKey: 'address_id' });
Address.hasMany(Order, { foreignKey: 'address_id' });

OrderStatus.hasMany(Order, { foreignKey: 'status_id' });
Order.belongsTo(OrderStatus, { foreignKey: 'status_id' });



module.exports = {
  sequelize,
  User,

  Order,
  OrderItem,
  Product,
  Category,
  Address,
  OrderStatus,

  Role,
  Company,
  Footer,
};
