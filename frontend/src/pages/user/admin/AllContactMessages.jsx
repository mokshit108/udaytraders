import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faDownload, } from "@fortawesome/free-solid-svg-icons";
import { useExcel } from "../../../hooks/useExcel";

const AllContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { downloadData, importExcelData } = useExcel();

  const handleDownloadExcel = () => {
    downloadData(messages, 'AllMessages');
  };


  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/profile/admin/all-messages`);

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Group messages by email
  const groupedMessages = messages.reduce((acc, message) => {
    if (!acc[message.email]) {
      acc[message.email] = [];
    }
    acc[message.email].push(message);
    return acc;
  }, {});

  return (
    <div className="p-4">
      <h2 className="text-3xl lg:text-4xl font-palanquin font-bold mb-8 text-sky-950 text-center">
        All Contact Messages
      </h2>
      <button
          onClick={handleDownloadExcel}
          className="bg-green-600 text-white px-3 ml-3 mb-5 py-2 rounded inline-flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faDownload} /> {/* Download icon */}
          Download Excel
      </button>

      {loading ? (
        <div className="flex justify-center items-center h-screen w-full">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-5xl text-sky-900"
          />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : Object.keys(groupedMessages).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.keys(groupedMessages).map((email) => (
            <div
              key={email}
              className="bg-white p-6 shadow-md border border-gray-300 rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg"
            >
              <h3 className="text-xl font-bold text-center text-sky-700 mb-4">
                {groupedMessages[email][0].name}
              </h3>
              <p className="text-gray-600 mb-3">
                <span className="font-semibold text-sky-600">Email:</span> {email}
              </p>

              {/* Display all messages for this user */}
              <div className="mt-4 space-y-4">
                {groupedMessages[email].map((message, index) => (
                  <div key={message.id} className="border-l-4 border-sky-700 pl-4">
                    <p className="text-base text-gray-800">
                      <span className="font-semibold text-sky-600">Message {index + 1}:</span> <br></br> {message.query}
                    </p>

                    {/* Format the created_at date */}
                    <p className="text-gray-500 text-sm italic mt-1">
                      {new Date(message.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center font-palanquin text-2xl mb-6">
          No messages found.
        </p>
      )}
    </div>
  );
};

export default AllContactMessages;
