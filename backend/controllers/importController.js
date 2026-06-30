const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const XLSX = require('xlsx');
const multer = require('multer');

// Table configuration object - define validation rules and mappings for each table
const tableConfigs = {
  // users: {
  //   requiredColumns: ['username', 'email', 'phone'],
  //   uniqueConstraints: ['email'],
  //   transformations: {
  //     email: (value) => value.toLowerCase().trim(),
  //     username: (value) => value.trim(),
  //     phone: (value) => value?.trim() || null
  //   },
  //   beforeInsert: async (data) => {
  //     const defaultPassword = Math.random().toString(36).slice(-8);
  //     const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  //     return {
  //       ...data,
  //       password: hashedPassword,
  //       defaultPassword, // This will be returned in the response but not stored
  //       role_id: data.role_id || 2,
  //       created_at: 'NOW()'
  //     };
  //   },
  //   table: 'users'
  // },
  // Add more table configurations as needed
  companies: {
    requiredColumns: ['name'],
    uniqueConstraints: ['name'],
    transformations: {
      name: (value) => value.trim(),
      price: (value) => parseFloat(value),
      category: (value) => value.trim()
    },
    beforeInsert: async (data) => ({
      ...data,
    }),
    table: 'companies'
  },
  categories: {
    requiredColumns: ['name','description'],
    uniqueConstraints: ['name'],
    transformations: {
      name: (value) => value.trim(),
      description: (value) => value.trim(),
      
    },
    beforeInsert: async (data) => ({
      ...data,
    }),
    table: 'categories'
  },
  coupons: {
    requiredColumns: ["code", "discount", "expiration_date"],
    uniqueConstraints: ["code", "discount"],
    transformations: {
      code: (value) => (typeof value === "string" ? value.trim() : value),   
      discount: (value) => parseFloat(value) || 0, // Ensure discount is a valid decimal
      expiration_date: (value) => {
        if (!value) return null; // Handle empty values
  
        if (typeof value === "number") {
          // Convert Excel numeric timestamp (days since 1900-01-01) to a JavaScript Date
          const excelEpoch = new Date(1899, 11, 30); // Excel starts from 1900-01-01, JavaScript starts from 1970-01-01
          return new Date(excelEpoch.getTime() + value * 86400000); // Convert days to milliseconds
        }
  
        if (typeof value === "string" && /^\d{2}-\d{2}-\d{4}$/.test(value)) {
          // Handle "DD-MM-YYYY" format
          const [day, month, year] = value.split("-").map(Number);
          return new Date(year, month - 1, day);
        }
  
        // Handle already valid date strings like "YYYY-MM-DD"
        const parsedDate = new Date(value);
        return isNaN(parsedDate) ? null : parsedDate;
      },
      created_at: () => new Date(),
      //created_at: (value) => (value ? new Date(value) : new Date()), // Default to now if missing
    },
    beforeInsert: async (data) => ({
      ...data,
      created_at: new Date(),
    }),
    table: "coupons",
  },
  products: {
    requiredColumns: ['name', 'description', 'price', 'stock', 'img_url', 'company_name', "category_name", "is_popular"],
    uniqueConstraints: ["name"],
    transformations: {
      name: (value) => value.trim(),
      description: (value) => value.trim(), 
      price: (value) => parseFloat(value) || 0,
      stock: (value) => value.toLowerCase() === 'yes' ? 1 : 0,
      img_url: (value) => value.trim(),
      is_popular: (value) => value.toLowerCase() === 'yes' ? 1 : 0
    },
    beforeInsert: async (data) => {
      try {
        const companyQuery = await pool.query(
          'SELECT id FROM companies WHERE name = $1',
          [data.company_name]
        );
        const categoryQuery = await pool.query(
          'SELECT id FROM categories WHERE name = $1',
          [data.category_name]
        );
        
        const { company_name, category_name, ...rest } = data;
        return {
          ...rest,
          company_id: companyQuery.rows[0]?.id,
          category_id: categoryQuery.rows[0]?.id,
          created_at: new Date()
        };
      } catch (error) {
        throw new Error('Failed to lookup company or category');
      }
    },
    table: "products"
 }
};

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel (.xls, .xlsx) or CSV files are allowed.'));
    }
  }
}).single('file');

// Generic data validation function
const validateData = (data, config) => {
  const errors = [];
  
  // Check for required fields
  config.requiredColumns.forEach(column => {
    if (!data[column] || String(data[column]).trim() === '') {
      errors.push(`${column} is required`);
    }
  });
  
  return errors;
};

// Dynamic import function
const importExcelData = async (req, res) => {
  let client;
  
  try {
    // Get table name from request params
    const { table } = req.params;
    const tableConfig = tableConfigs[table];

    if (!tableConfig) {
      return res.status(400).json({
        status: 'error',
        message: `Import configuration not found for table: ${table}`
      });
    }

    // Handle file upload
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    // Read Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Excel file is empty'
      });
    }

    // Validate required columns
    const firstRow = data[0];
    const missingColumns = tableConfig.requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Missing required columns: ${missingColumns.join(', ')}`
      });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const results = [];
    const errors = [];

    // Process each row
    for (const [index, row] of data.entries()) {
      try {
        // Validate row data
        const validationErrors = validateData(row, tableConfig);
        if (validationErrors.length > 0) {
          throw new Error(validationErrors.join(', '));
        }

        // Check unique constraints
        for (const constraint of tableConfig.uniqueConstraints) {
          const existingRecord = await client.query(
            `SELECT id FROM ${tableConfig.table} WHERE ${constraint} = $1`,
            [tableConfig.transformations[constraint](row[constraint])]
          );

          if (existingRecord.rows.length > 0) {
            throw new Error(`Record already exists with ${constraint}: ${row[constraint]}`);
          }
        }

        // Transform data
       let transformedData = {};
        for (const [key, value] of Object.entries(row)) {
          if (tableConfig.transformations[key]) {
              transformedData[key] = tableConfig.transformations[key](value);
          } else {
            transformedData[key] = value;
          }
        }

        // Apply any additional transformations
        if (tableConfig.beforeInsert) {
          transformedData = await tableConfig.beforeInsert(transformedData);
        }

        // Generate insert query
        const columns = Object.keys(transformedData).filter(key => key !== 'defaultPassword');
        const values = columns.map((_, i) => `$${i + 1}`);
        const insertQuery = `
          INSERT INTO ${tableConfig.table} (${columns.join(', ')})
          VALUES (${values.join(', ')})
          RETURNING *
        `;

        const queryParams = columns.map(col => {
          return transformedData[col] === 'NOW()' ? new Date() : transformedData[col];
        });

        const newRecord = await client.query(insertQuery, queryParams);

        // Add the created record to results array
        results.push({
          ...newRecord.rows[0],
          ...(transformedData.defaultPassword && { defaultPassword: transformedData.defaultPassword })
        });

      } catch (error) {
        errors.push({
          row: index + 1,
          data: row,
          error: error.message
        });
      }
    }

    // Handle results
    if (errors.length === data.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: 'error',
        message: `No records could be imported to ${table}`,
        errors,
        successCount: 0
      });
    }

    if (errors.length > 0) {
      await client.query('COMMIT');
      return res.status(207).json({
        status: 'partial_success',
        message: `Some records were imported to ${table} with errors`,
        errors,
        successCount: results.length,
        records: results
      });
    }

    await client.query('COMMIT');
    return res.status(200).json({
      status: 'success',
      message: `All records imported successfully to ${table}`,
      successCount: results.length,
      records: results
    });

  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error(`Error in importExcelData for ${req.params.table}:`, error);
    return res.status(500).json({
      status: 'error',
      message: `Server error while importing ${req.params.table}`,
      error: error.message
    });
  } finally {
    if (client) client.release();
  }
};

module.exports = {
  importExcelData
};