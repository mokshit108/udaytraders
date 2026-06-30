const models = require('../models'); // Import all Sequelize models
const { Role, Category , Company } = require("../models");
const getModel = (tableName) => {
  return models[tableName];
};

// Reusable CRUD controller
const crudController = {
  create: async (req, res) => {
    const { table } = req.params;
    const model = getModel(table);
    if (!model) {
      return res.status(400).json({ message: "Invalid table name" });
    }
    // Assuming expiryDate is the field with the date
    try {
      if (table === "Coupon"){const { code, discount, expiryDate } = req.body;

      // Validate expiryDate
      if (!expiryDate) {
        return res.status(400).json({ message: "Expiry date is required." });
      }

      // Parse the expiryDate and ensure it's in the correct format
      const expiryDateObj = new Date(expiryDate);
      if (isNaN(expiryDateObj.getTime())) {
        return res.status(400).json({ message: "Invalid expiry date format." });
      }

      // Set time to 00:00:00 if not provided
      expiryDateObj.setUTCHours(0, 0, 0, 0);

      const newRecord = await model.create({
        code,
        discount,
        expiration_date: expiryDateObj.toISOString(), // Save as ISO string
      });

      return res.status(201).json(newRecord);
    }

    if (req.body.category_name && req.body.company_name) {
      const category = await Category.findOne({ where: { name: req.body.category_name } });
      const company = await Company.findOne({ where: { name: req.body.company_name } });
      req.body.category_id = category.id; // Update with role ID if role_name is provided
      req.body.company_id = company.id;
      const newRecord = await model.create(req.body);
      return res.status(201).json(newRecord);
    }
    
      const newRecord = await model.create(req.body);
      return res.status(201).json(newRecord);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  readAll: async (req, res) => {
    const { table } = req.params;
    const model = getModel(table);
    if (!model) {
      return res.status(400).json({ message: "Invalid table name" });
    }

    try {
      const records = await model.findAll();
      return res.status(200).json(records);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  readOne: async (req, res) => {
    const { table, id } = req.params;
    const model = getModel(table);
    if (!model) {
      return res.status(400).json({ message: "Invalid table name" });
    }

    try {
      const record = await model.findByPk(id);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
      return res.status(200).json(record);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  update: async (req, res) => {
    const { table, id } = req.params;
    const model = getModel(table);
    if (!model) {
      return res.status(400).json({ message: "Invalid table name" });
    }

    try {
      const record = await model.findByPk(id);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
      if (req.body.role_name) {
        const role = await Role.findOne({ where: { name: req.body.role_name } });
        if (!role) {
          return res.status(400).json({ message: "Invalid role name" });
        }
        req.body.role_id = role.id; // Update with role ID if role_name is provided
      }

      await record.update(req.body);
      return res.status(200).json(record);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  delete: async (req, res) => {
    const { table, id } = req.params;
    const model = getModel(table);

    if (!model) {
      return res.status(400).json({ message: "Invalid table name" });
    }

    try {
      const record = await model.findByPk(id);
      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }
      await record.destroy();
      return res.status(200).json({ message: "Record deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = crudController;
