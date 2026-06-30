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
    if (!acc[curr.section]) {
      acc[curr.section] = [];
    }
    acc[curr.section].push(curr);
    return acc;
  }, {});

  return (
    <footer className='max-container sm:pt-6 sm:pb-3 lg:pt-12 lg:pb-6 bg-black padding-x'>
      <div className='flex justify-between items-start gap-10 flex-wrap max-lg:flex-col'>
        <div className='flex flex-col items-start'>
          <h3 className="max-md:text-3xl text-4xl font-palanquin font-bold text-white">
            Uday Traders
          </h3>
          <p className='mt-6 text-base leading-7 font-montserrat text-white-400 sm:max-w-sm'>
            Your premium destination for top-quality bathroom essentials.
          </p>
        </div>

        <div className='flex flex-1 justify-between lg:gap-10 gap-10 flex-wrap'>
          {Object.entries(groupedFooterData).map(([section, links]) => (
            <div key={section}>
              <h4 className='max-md:text-xl font-montserrat text-2xl leading-normal font-medium mb-6 text-white'>
                {section}
              </h4>
              <ul>
                {links.map((link) => (
                  <li
                    className='mt-3 font-montserrat text-base leading-normal text-white-400 hover:text-slate-gray'
                    key={link.id}
                  >
                    <a href={link.link}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className='flex justify-between text-white-400 mt-20 max-sm:flex-col max-sm:items-center'>
        <div className='flex flex-1 justify-start items-center gap-2 font-montserrat cursor-pointer'>
          <p>Copyright. All rights reserved.</p>
        </div>
        <p className='font-montserrat cursor-pointer'>Developed by Mokshit Shah</p>
      </div>
    </footer>
  );
};

export default Footer;
