import { handleDownload } from '../utils/downloadUtils';

export const useExcel = () => {
  const downloadData = (data, filename) => {
    handleDownload(data, filename);
  };

  const importExcelData = async (file, tableName, onSuccess, onError) => {
    try {
      if (!tableName) {
        throw new Error("Table name is required.");
      }

      const formData = new FormData();
      formData.append('file', file);
  
      const apiUrl = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${apiUrl}/import/data/${tableName}`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        // Handle validation errors
        if (response.status === 400 && responseData.errors) {
          const errorMessage = responseData.errors.map(err => 
            `Row ${err.row}: ${err.error}`
          ).join('\n');
          throw new Error(errorMessage);
        }
        throw new Error(responseData.message || 'Failed to import users');
      }
  
      onSuccess?.(responseData);
      return responseData;
    } catch (error) {
      console.error('Error importing Excel:', error);
      onError?.(error.message);
      throw error;
    }
  };

  return { downloadData, importExcelData };
};
