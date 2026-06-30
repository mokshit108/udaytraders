import ServiceCard from "../components/ServiceCard";
import { services } from "../constants";

const Services = () => {
  return (
    <>
      <h2 className="text-black font-palanquin text-2.5xl md:text-3.5xl lg:text-3xl xl:text-4xl font-bold text-start max-md:mb-4 m-2 mb-8">
        Simple <span className='text-sky-700'> 3 Step </span> Process
      </h2>
      <section className="flex flex-col lg:flex-row justify-center gap-6">
        {services.map((service) => (
          <ServiceCard key={service.label} {...service} />
        ))}
      </section>
    </>
  );
};

export default Services;
