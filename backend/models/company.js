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
      slug: {
        type: DataTypes.STRING,
        unique: true,
      },
      part: {
        type: DataTypes.CHAR(1),
      },
      cover_url: {
        type: DataTypes.TEXT,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "companies",
      timestamps: false,
    }
  );

  Company.associate = (models) => {
    Company.hasMany(models.Product, { foreignKey: "company_id", onDelete: "CASCADE" });
    Company.hasMany(models.CataloguePage, { foreignKey: "company_id", onDelete: "CASCADE" });
  };

  return Company;
};
