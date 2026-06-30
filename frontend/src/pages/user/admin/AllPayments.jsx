import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner,  faDownload, } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useExcel } from "../../../hooks/useExcel";

const AllPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { downloadData, importExcelData } = useExcel();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    const getDaySuffix = (day) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${getDaySuffix(day)} ${month} ${year}`;
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/profile/admin/all-payments`);

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setPayments(data.payments);
      } catch (error) {
        console.error("Error fetching all payments:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleDownloadExcel = () => {
    downloadData(payments, 'AllPayments');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl lg:text-3xl font-palanquin font-bold mb-6 text-sky-950">
        All Payments
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
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-sky-900" />
          <span className="ml-2">Loading payments...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : Array.isArray(payments) && payments.length > 0 ? (
        <div className="space-y-4 justify-center">
          {/* Responsive Table for MD and larger screens */}
          <div className="hidden md:flex justify-between bg-sky-100 p-4 rounded-lg shadow-md mb-4">
            <div className="text-center font-bold text-lg text-sky-700 w-1/5">User</div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/5">Order ID</div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/5">Amount</div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/4">Date</div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/5">Status</div>
            <div className="text-center font-bold text-lg text-sky-700 w-1/5">Method</div>
          </div>

          {/* Payment Entries for Mobile View */}
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white shadow border border-gray-200 rounded-lg font-medium text-lg p-4 flex flex-col space-y-4 md:space-y-0 md:flex-row items-start md:items-center justify-between"
            >
              {/* For Mobile View - Card Format */}
              <div className="flex flex-col space-y-2 md:hidden">
                <div>
                  <span className="text-gray-600 font-semibold">User: </span>
                  <span className="text-gray-800">{payment.userName}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Order ID: </span>
                  <span className="text-gray-800">{payment.o_id}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Amount: </span>
                  <span className="text-gray-800">₹{payment.final_amount}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Date: </span>
                  <span className="text-gray-800">{formatDate(payment.created_at)}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Status: </span>
                  <span className="text-gray-800">{payment.status}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-semibold">Method: </span>
                  <span className="text-gray-800">{payment.method}</span>
                </div>
              </div>

              {/* For larger screens */}
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center text-center md:w-1/5">
                <div className="text-gray-800">{payment.userName}</div>
              </div>
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center text-center md:w-1/5">
                <div className="text-gray-800">{payment.o_id}</div>
              </div>
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center md:w-1/5">
                <div className="text-gray-800">₹{payment.final_amount}</div>
              </div>
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center md:w-1/4">
                <div className="text-gray-800">{formatDate(payment.created_at)}</div>
              </div>
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center md:w-1/5">
                <div className="text-gray-800">{payment.status}</div>
              </div>
              <div className="hidden md:flex flex-col md:flex-row md:items-center justify-center md:w-1/5">
                <div className="text-gray-800">{payment.method}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-800 text-center font-palanquin text-3xl mb-6">No payments found.</p>
      )}
    </div>
  );
};

export default AllPayments;
