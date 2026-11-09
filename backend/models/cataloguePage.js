module.exports = (sequelize, DataTypes) => {
  const CataloguePage = sequelize.define(
    "CataloguePage",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      company_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "companies",
          key: "id",
        },
      },
      page_no: {
        type: DataTypes.INTEGER,
      },
      image_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      public_id: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "catalogue_pages",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["company_id", "page_no"],
          name: "catalogue_pages_company_page_unique",
        },
      ],
    }
  );

  CataloguePage.associate = (models) => {
    CataloguePage.belongsTo(models.Company, { foreignKey: "company_id", onDelete: "CASCADE" });
  };

  return CataloguePage;
};
