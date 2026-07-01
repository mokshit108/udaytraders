const { Category, Product, OrderStatus, Role, Company, Footer } = require('../models');

async function insertSampleData() {
  try {
    // Insert default roles if not already present
    await Role.findOrCreate({ where: { name: 'admin' } });
    await Role.findOrCreate({ where: { name: 'partner' } });

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
    const products = [
      //Normal Series
      { name: 'Soap Dish', description: 'High quality Soap Dish', price: 540, stock: 1, category_id: 1, img_url: 'https://res.cloudinary.com/dvkqmeoav/image/upload/v1740043163/SoapDish540_xwklyt.png', company_id: 1, is_popular: 0 },
      { name: 'Tumbler', description: 'High quality Tumbler', price: 708, stock: 1, category_id: 1, img_url: 'https://res.cloudinary.com/dvkqmeoav/image/upload/v1740043162/Tumbler708_ikve6o.png', company_id: 1, is_popular: 0 },
      { name: 'Robe Hook', description: 'High quality Robe Hook', price: 380, stock: 1, category_id: 1, img_url: 'https://res.cloudinary.com/dvkqmeoav/image/upload/v1740043162/RobeHook380_xlts3t.png', company_id: 1, is_popular: 0 },
      { name: 'Dispenser', description: 'High quality Dispenser', price: 820, stock: 1, category_id: 1, img_url: 'https://res.cloudinary.com/dvkqmeoav/image/upload/v1740043161/Dispenser820_qnr7qo.png', company_id: 1, is_popular: 0 },

      { name: 'Double Soap Dish', description: 'High quality Soap Dish', price: 944, stock: 1, category_id: 1, img_url: 'https://res.cloudinary.com/dvkqmeoav/image/upload/v1739688060/DoubleSoapDish944_t4mt3n.png', company_id: 1, is_popular: 0 },
      { name: 'Paper Holder', description: 'High quality Paper Holder', price: 940, stock: 1, category_id: 1, img_url: 'https://res.cloudinary.com/dvkqmeoav/image/upload/v1739688242/PaperHolder940_gigc5a.png', company_id: 1, is_popular: 0 },
      { name: 'Soap Dish with Dispenser', description: 'High quality Soap Dish with Dispenser', price: 1240, stock: 1, category_id: 1, img_url: 'https://res.cloudinary.com/dvkqmeoav/image/upload/v1739688335/SoapDishwithDispenser1112_bz7bra.png', company_id: 1, is_popular: 0 },
      { name: 'Soap Dish with Tumbler', description: 'High quality Soap Dish with Tumbler', price: 1080, stock: 1, category_id: 1, img_url: 'https://res.cloudinary.com/dvkqmeoav/image/upload/v1739688409/SoapDishwithTumbler1080_nmrbpm.png', company_id: 1, is_popular: 0 },

      //Gold Series
      { name: 'Gold Dispenser', description: 'High quality Gold Dispenser', price: 1180, stock: 1, category_id: 1, img_url: 'https://res.cloudinary.com/dvkqmeoav/image/upload/v1740046838/GoldDispenser1180_tow5ng.png', company_id: 1, is_popular: 1 },
      { name: 'Gold Soap Dish', description: 'High quality Gold Soap Dish', price: 1140, stock: 1, category_id: 1, img_url: 'https://res.cloudinary.com/dvkqmeoav/image/upload/v1740046838/GoldSoapDish1140_pqkfof.png', company_id: 1, is_popular: 1 },
      { name: 'Gold Robe Hook', description: 'High quality Gold Robe Hook', price: 600, stock: 1, category_id: 1, img_url: 'https://res.cloudinary.com/dvkqmeoav/image/upload/v1740046839/RobeHook600_cmfq6y.png', company_id: 1, is_popular: 1 },
      { name: 'Gold Double Soap Dish', description: 'High quality Gold Double Soap Dish', price: 2060, stock: 1, category_id: 1, img_url: 'https://res.cloudinary.com/dvkqmeoav/image/upload/v1740046838/GoldDoubleSoapDish2060_dsuwxx.png', company_id: 1, is_popular: 1 },

      { name: 'Goldline Vibro Bib Cock', description: 'High quality Vibro Bib Cock', price: 1030, stock: 1, category_id: 1, img_url: 'https://goldlinebathfittings.com/wp-content/uploads/2021/07/4.jpg', company_id: 2, is_popular: 0 },
      { name: 'Goldline Vibro Sink Cock', description: 'High quality Vibro Sink Cock', price: 1785, stock: 1, category_id: 1, img_url: 'https://goldlinebathfittings.com/wp-content/uploads/2021/07/12.jpg', company_id: 2, is_popular: 0 },
      { name: 'Goldline Vibro Angle Cock', description: 'High quality Vibro Angle Cock', price: 1030, stock: 1, category_id: 1, img_url: 'https://goldlinebathfittings.com/wp-content/uploads/2021/07/7.jpg', company_id: 2, is_popular: 0 },
      { name: 'Goldline Vibro Pillar Cock', description: 'High quality Pillar Cock', price: 1345, stock: 1, category_id: 1, img_url: 'https://goldlinebathfittings.com/wp-content/uploads/2021/07/3.jpg', company_id: 2, is_popular: 0 },
      { name: 'Goldline Prime Bib Cock', description: 'Goldline Prime Bib Cock for bathroom', price: 855, stock: 1, category_id: 1, img_url: 'https://goldlinebathfittings.com/wp-content/uploads/2019/12/gold-prime3-min.png', company_id: 2, is_popular: 1 },
      { name: 'Goldline Prime Long Nose', description: 'Goldline Prime Long Nose for bathroom', price: 975, stock: 1, category_id: 1, img_url: 'https://goldlinebathfittings.com/wp-content/uploads/2019/12/gold-prime6-min.png', company_id: 2, is_popular: 1 },
      { name: 'Goldline Prime Pillar Cock', description: 'Goldline Prime Pillar Cock for luxury bathrooms', price: 1120, stock: 1, category_id: 1, img_url: 'https://goldlinebathfittings.com/wp-content/uploads/2019/12/gold-prime2-min.png', company_id: 2, is_popular: 1 },
      { name: 'Goldline Prime Angle Cock', description: 'Goldline Prime Angle Cock for bathroom', price: 855, stock: 1, category_id: 1, img_url: 'https://goldlinebathfittings.com/wp-content/uploads/2019/12/gold-prime7-min.png', company_id: 2, is_popular: 1 },
      { name: 'Goldline Prime 3 in 1 Wall Mixer', description: 'Goldline Prime 3 in 1 Wall Mixer for bathroom', price: 5575, stock: 1, category_id: 1, img_url: 'https://goldlinebathfittings.com/wp-content/uploads/2019/12/gold-prime14-min.png', company_id: 2, is_popular: 1 },
      { name: 'Goldline Prime 2 in 1 Bib Cock', description: 'Goldline Prime 2 in 1 Bib Cock for luxury bathrooms', price: 1695, stock: 1, category_id: 1, img_url: 'https://goldlinebathfittings.com/wp-content/uploads/2019/12/gold-prime9-min.png', company_id: 2, is_popular: 1 },
      { name: 'Goldline Prime Sink Cock', description: 'Goldline Sink Cock for luxury bathrooms', price: 1475, stock: 1, category_id: 1, img_url: 'https://goldlinebathfittings.com/wp-content/uploads/2019/12/gold-prime11-min.png', company_id: 2, is_popular: 1 },
    ];

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
