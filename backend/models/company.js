module.exports = (sequelize, DataTypes) => {
  const Company = sequelize.define(
    "Company",
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
    },
    {
      tableName: "companies",
      timestamps: false,
    }
  );

  Company.associate = (models) => {
    Company.hasMany(models.Product, { foreignKey: "company_id", onDelete: "CASCADE" });
  };

  return Company;
};
