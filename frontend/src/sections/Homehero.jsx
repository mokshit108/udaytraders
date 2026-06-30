import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const Homehero = () => {
  return (
    <>
      <section
        id="home-hero"
        className="flex flex-col max-sm:pt-32  md:pt-32 lg:pt-36 lg:ml-16   lg:flex-row"
      >
        <div className="w-full lg:w-[60%]">
          <Carousel
            autoPlay
            interval={3000}
            infiniteLoop
            showThumbs={false}
            showStatus={false}
            className="h-full flex items-center"
          >
            <div className="h-full">
              <img
                src="https://goldlinebathfittings.com/wp-content/uploads/2022/10/b6.jpg"
                alt="Slide 1"
                className="object-cover h-full w-full"
              />
            </div>
            <div className="h-full">
              <img
                src="https://goldlinebathfittings.com/wp-content/uploads/2022/10/b4.jpg"
                alt="Slide 2"
                className="object-cover h-full w-full"
              />
            </div>
            <div className="h-full">
              <img
                src="https://goldlinebathfittings.com/wp-content/uploads/2022/10/banner3-1.jpg"
                alt="Slide 3"
                className="object-cover h-full w-full"
              />
            </div>
          </Carousel>
        </div>
        <div className="w-full md:px-16 lg:px-0 flex flex-col md:flex-col md:w-full lg:w-[40%] justify-start max-sm:padding-leftright  ">
          <h2 className="font-palanquin text-2.5xl md:text-3.5xl lg:text-3xl xl:text-4xl font-bold text-start max-md:mx-3 mt-4 lg:px-4">
            <span className="lg:bg-white text-black lg:whitespace-nowrap relative">
              Bathing in
              <span className="text-sky-700 ml-2">Elegance</span>
            </span>
          </h2>
          <p className="md:text-xl text-start font-montserrat font-medium text-gray-500 text-md w-full content-fit leading-7 my-3 max-md:mx-3 lg:px-4 md:mt-4">
            Experience luxury and sophistication with our newest bath
            collection. Transform your space with elegant and innovative designs
            today.
          </p>
        </div>
      </section>
    </>
  );
};

export default Homehero;
