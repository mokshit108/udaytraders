import { useState, useEffect } from 'react';

const TypingCarousel = () => {
  const messages = [
    "Use code 'TAKE3' for a 3% discount",
    "Hurry! Limited time offer!",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseDuration = 2000; // 2 second pause duration

  useEffect(() => {
    let typingTimeout;

    if (!isDeleting && textIndex < messages[currentMessageIndex].length) {
      // Typing effect
      typingTimeout = setTimeout(() => {
        setDisplayedText((prev) => prev + messages[currentMessageIndex][textIndex]);
        setTextIndex(textIndex + 1);
      }, typingSpeed);
    } else if (isDeleting && textIndex > 0) {
      // Deleting effect
      typingTimeout = setTimeout(() => {
        setDisplayedText((prev) => prev.slice(0, -1));
        setTextIndex(textIndex - 1);
      }, deletingSpeed);
    } else if (!isDeleting && textIndex === messages[currentMessageIndex].length) {
      // Pause after fully typing the message
      typingTimeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
    } else if (isDeleting && textIndex === 0) {
      // Move to the next message
      setIsDeleting(false);
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }

    return () => clearTimeout(typingTimeout);
  }, [textIndex, isDeleting, currentMessageIndex, messages]);

  return (
    <div className="text-center fixed top-0 left-0 w-full py-2 bg-sky-100 z-50 shadow-md">
      <span className="font-bold text-[#0369a1] text-sm md:text-lg">
        {displayedText}
      </span>
      <span className="inline-block animate-blink text-[#0369a1] text-lg">|</span>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default TypingCarousel;
