import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { faqData } from '../../constants/index'; // Importing the FAQ data

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className=" m-5 transition-all duration-1000 ease-in-out border-b-sky-700 border-b-2 text-black font-montserrat font-bold text-md">
      <button
        className="w-full text-left px-4 py-2 flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FontAwesomeIcon icon={isOpen ? faMinus : faPlus} className="text-black mr-4 transition-transform duration-1000 ease-in-out" />
        <span className="text-lg font-medium ">{question}</span>
      </button>
      <div
        className={`overflow-hidden transition-max-height duration-1000 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
      >
        <div className="px-8 py-5 text-black font-montserrat text-md font-medium">
          {answer}
        </div>
      </div>
    </div>
  );
};

const FAQAccordion = () => {
  return (
    <div className="max-w-xl mx-auto mt-10">
      {faqData.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
};

export default FAQAccordion;