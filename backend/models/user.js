module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null for Google logins
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true, // Optional for Google logins
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // Optional for Google logins
      },
      google_id: {
        type: DataTypes.STRING,
        allowNull: true, // Only populated for Google users
        unique: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2, // Default to customer role
        references: {
          model: 'roles', // Refers to table name 'roles'
          key: 'id', // Refers to the column 'id' in roles table
        },
      },
    }, {
      tableName: 'users',
      timestamps: false,
    });

  User.associate = (models) => {
    // Existing associations

    User.hasMany(models.Order, { foreignKey: 'user_id' });
    User.hasMany(models.Address, { foreignKey: 'user_id' });

    // New association with Role
    User.belongsTo(models.Role, { foreignKey: 'role_id' }); // User has a role_id foreign key
  };

  return User;
};
