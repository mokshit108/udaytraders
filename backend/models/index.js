const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: 'postgres',
  port: process.env.DB_PORT || 5432, // Use the port from env variables or default to 5432
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  },
  // dialect: 'postgres',
  // host: process.env.DB_HOST,
  // username: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  logging: false, // Set to true if you want to see SQL queries in the console
});

// Import models
const User = require('./user')(sequelize, Sequelize.DataTypes);
const ContactMessage = require('./contactMessage')(sequelize, Sequelize.DataTypes);
const Order = require('./order')(sequelize, Sequelize.DataTypes);
const OrderItem = require('./orderItem')(sequelize, Sequelize.DataTypes);
const Product = require('./product')(sequelize, Sequelize.DataTypes);
const Category = require('./category')(sequelize, Sequelize.DataTypes);
const Company = require('./company')(sequelize, Sequelize.DataTypes);
const Address = require('./address')(sequelize, Sequelize.DataTypes);
const Payment = require('./payment')(sequelize, Sequelize.DataTypes);
const OrderStatus = require('./orderStatus')(sequelize, Sequelize.DataTypes);
const Coupon = require('./coupon')(sequelize, Sequelize.DataTypes);
const Role = require('./role')(sequelize, Sequelize.DataTypes); // New Role model
const Footer = require('./footer')(sequelize, Sequelize.DataTypes); // New Role model
const Agent = require('./agent')(sequelize, Sequelize.DataTypes); // New Agent model
const AgentTransaction = require('./agentTransaction')(sequelize, Sequelize.DataTypes);


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

Payment.belongsTo(Order, { foreignKey: 'o_id' });
Order.hasOne(Payment, { foreignKey: 'o_id' });

User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

// **New Agent & Order Relationship**: Each order is assigned to one agent
Agent.hasMany(Order, { foreignKey: 'agent_id' }); // One agent can have many orders
Order.belongsTo(Agent, { foreignKey: 'agent_id' }); // Each order is assigned to one agent

Agent.hasMany(AgentTransaction, { foreignKey: 'agent_id' }); // One agent can have many transactions
AgentTransaction.belongsTo(Agent, { foreignKey: 'agent_id' }); // Each transaction belongs to one agent

Order.hasMany(AgentTransaction, { foreignKey: 'order_id' }); // An order can have multiple transactions
AgentTransaction.belongsTo(Order, { foreignKey: 'order_id' }); // Each transaction is linked to one order

// **New User & Agent Relationship**: A user can be associated with many agents (optional relationship)
User.hasMany(Agent, { foreignKey: 'user_id' }); // A user can have many agents (if applicable)
Agent.belongsTo(User, { foreignKey: 'user_id' }); // Each agent belongs to one user

module.exports = {
  sequelize,
  User,
  ContactMessage,
  Order,
  OrderItem,
  Product,
  Category,
  Address,
  Payment,
  OrderStatus,
  Coupon,
  Role,
  Company,
  Footer,
  Agent,
  AgentTransaction,
};
