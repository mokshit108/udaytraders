import { tap } from "../assets/images";

const SuperQuality = () => {
  return (
    <section
      id="about-us"
      className="flex justify-between items-center max-lg:flex-col gap-10 w-full max-container"
    >
      <div className="flex flex-1 flex-col gap-2">
        <h2 className="font-palanquin text-2.5xl md:text-3.5xl lg:text-3xl xl:text-4xl font-bold text-start md:m-2 max-md:mx-3">
          Super
          <span className="text-sky-700"> Quality</span> Product
        </h2>
        <p className="md:text-xl text-start font-montserrat font-medium text-gray-500 text-md w-full content-fit leading-7 mx-2 md:m-2 max-md:mx-3">
          Explore our premium bathroom essentials, designed for luxury and
          comfort.
        </p>
        <p className="md:text-xl text-start font-montserrat font-medium text-gray-500 text-md w-full content-fit leading-7 mx-2 md:m-2 max-md:mx-3">
          At Onestopbath, we bring together style, durability, and luxury to
          transform your bathroom into a space of comfort.
        </p>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <img
          src={tap}
          alt="product detail"
          width={470}
          height={422}
          className="object-contain w-[302px] h-[302px] md:w-[470px] md:h-[422px]"
        />
      </div>
    </section>
  );
};

export default SuperQuality;
