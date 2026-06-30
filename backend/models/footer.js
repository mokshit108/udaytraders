module.exports = (sequelize, DataTypes) => {
  const Footer = sequelize.define(
    "Footer",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      section: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "footer",
      timestamps: false,
    }
  );

  return Footer;
};
