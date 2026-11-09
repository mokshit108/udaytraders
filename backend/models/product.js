module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "categories",
          key: "id",
        },
      },
      img_url: {
        type: DataTypes.TEXT,
      },
      company_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "companies",
          key: "id",
        },
      },
      is_popular: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      series: {
        type: DataTypes.STRING,
      },
      code: {
        type: DataTypes.STRING(100),
      },
      section: {
        type: DataTypes.STRING(255),
      },
      variant_label: {
        type: DataTypes.STRING(255),
      },
      catalogue_page: {
        type: DataTypes.INTEGER,
      },
      source: {
        type: DataTypes.STRING(50),
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "products",
      timestamps: false,
    }
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, { foreignKey: "category_id", onDelete: "CASCADE"});
    Product.belongsTo(models.Company, { foreignKey: "company_id", onDelete: "CASCADE"});
    Product.hasMany(models.OrderItem, { foreignKey: "product_id" });
  };
  
  return Product;
};
