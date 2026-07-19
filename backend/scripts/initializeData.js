const { Category, Product, OrderStatus, Role, Company, Footer, User } = require('../models');
const bcrypt = require('bcryptjs');

async function insertSampleData() {
  try {
    // Insert default roles if not already present
    const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' } });
    await Role.findOrCreate({ where: { name: 'partner' } });

    // Insert default admin user if not already present
    const adminUsername = 'udaymoksh';
    const adminEmail = 'udaymoksh@gmail.com';
    const adminPassword = 'jaiaadinath@77';

    const existingAdmin = await User.findOne({ where: { username: adminUsername } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        role_id: adminRole.id
      });
      console.log('Admin user adminuday created.');
    } else {
      console.log('Admin user adminuday already exists.');
    }

    // Insert Categories if not already present
    const categories = [
      {
        name: 'Bathroom',
        description: 'Discover a diverse range of Faucet accessories designed for both functionality and style. Our kitchen collection includes durable and high-quality fittings that enhance your cooking experience and elevate your kitchen’s aesthetic.'
      },
    ];

    for (const category of categories) {
      await Category.findOrCreate({
        where: { name: category.name },
        defaults: category
      });
    }

    const companies = [
      {
        name: 'Well Finish',
      },
      {
        name: 'Goldline',
      },

    ];

    for (const company of companies) {
      await Company.findOrCreate({
        where: { name: company.name },
        defaults: company
      });
    }

    // Insert Products if not already present
    const products = [];

    for (const product of products) {
      await Product.findOrCreate({
        where: { name: product.name },
        defaults: product
      });
    }

    const orderStatuses = [
        { status: 'Pending', description: 'Order has been placed but not yet processed' },
        { status: 'Processing', description: 'Order is currently being processed' },
        { status: 'Shipped', description: 'Order has been shipped and is on the way' },
        { status: 'Delivered', description: 'Order has been delivered to the customer' },
        { status: 'Cancelled', description: 'Order has been cancelled by the customer or store' },
        { status: 'Returned', description: 'Order has been returned by the customer' },
      ];

      for (const orderStatus of orderStatuses) {
        await OrderStatus.findOrCreate({
          where: { status: orderStatus.status },
          defaults: orderStatus,
        });
      }


     // Insert footer data if not already present
     const footerSections = [
      { section: 'Get In Touch', name: 'Contact', link: '/contact-us' },
      { section: 'About', name: 'About', link: '/about-us' },
      { section: 'Shop', name: 'New Arrivals', link: '/new-arrivals' },
    ];

    for (const section of footerSections) {
      await Footer.findOrCreate({
        where: { section: section.section },
        defaults: section
      });
    }

  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

module.exports = { insertSampleData };
