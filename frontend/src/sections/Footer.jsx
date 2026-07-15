import { useEffect, useState } from 'react';

const Footer = () => {
  const [footerData, setFooterData] = useState([]);

  const tableName = "Footer"; // Set the table name

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await fetch(`${apiUrl}/profile/admin/crud/${tableName}`); // API to get footer data
      const data = await response.json();
      setFooterData(data);
    } catch (error) {
      console.error('Error fetching footer data:', error);
    }
  };

  // Group footer links by section title
  const groupedFooterData = footerData.reduce((acc, curr) => {
    if (
      curr.section.toLowerCase() === 'about' ||
      curr.section.toLowerCase() === 'shop' ||
      curr.name.toLowerCase() === 'new arrivals' ||
      curr.name.toLowerCase() === 'about'
    ) {
      return acc;
    }
    if (!acc[curr.section]) {
      acc[curr.section] = [];
    }
    acc[curr.section].push(curr);
    return acc;
  }, {});

  return (
    <footer className='w-full bg-black py-12 md:py-16 lg:py-24 px-6 md:px-12 lg:px-24'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-20'>
          
          {/* Left Side */}
          <div className='flex flex-col items-start w-full lg:w-1/2'>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-palanquin font-bold text-white tracking-wide">
              Uday Traders
            </h3>
            <p className='mt-4 md:mt-6 text-sm md:text-base lg:text-lg leading-relaxed font-montserrat text-gray-400 max-w-md lg:max-w-lg'>
              Your trusted B2B partner for premium quality bathroom fittings and accessories. We provide reliable, high-grade products to empower your business.
            </p>
          </div>

          {/* Right Side */}
          <div className='flex flex-col w-full lg:w-1/2 lg:items-end'>
            {Object.entries(groupedFooterData).map(([section, links]) => (
              <div key={section} className="w-full lg:text-right">
                <h4 className='text-xl md:text-2xl font-montserrat font-semibold mb-4 md:mb-6 text-white'>
                  {section}
                </h4>
                <ul className="flex flex-col gap-3 lg:items-end">
                  {links.map((link) => (
                    <li key={link.id}>
                      <a 
                        href={link.link}
                        className='font-montserrat text-sm md:text-base lg:text-lg text-gray-400 hover:text-white transition-colors duration-300'
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='w-full flex flex-col md:flex-row justify-between items-center mt-12 md:mt-20 pt-6 border-t border-gray-800 text-gray-400 gap-4'>
          <p className='font-montserrat text-xs md:text-sm lg:text-base'>
            &copy; {new Date().getFullYear()} Uday Traders. All rights reserved.
          </p>
          <p className='font-montserrat text-xs md:text-sm lg:text-base'>
            Developed by Mokshit Shah
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
