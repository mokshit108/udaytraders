const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  validationError,
  renderValidationIcon,
  additionalContent, // Add this prop for content below the input
  required = false,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-2 flex items-center">
        <input
          type={type}
          name={name}
          id={name}
          autoComplete={name}
          value={value}
          onChange={onChange}
          className={`block w-full border-b text-base leading-6 pl-1 py-1.5 ${
            validationError ? "border-red-500" : "border-sky-800"
          } text-sky-950 font-medium font-montserrat placeholder:pl-0 placeholder:text-gray-300 placeholder:font-montserrat placeholder:text-lg focus:outline-none ${
            validationError
              ? "focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "focus:border-sky-800 focus:ring-1 focus:ring-sky-800"
          }`}
          placeholder={placeholder}
          required={required}
        />
        {additionalContent && (
          <div className="mt-2 flex items-center justify-start">
            {additionalContent}
          </div>
        )}
        <div className="mt-2 flex items-center justify-center">
          {renderValidationIcon(name)}
        </div>
      </div>

      {validationError && (
        <p className="text-red-500 text-sm mt-1">{validationError}</p>
      )}
    </div>
  );
};

export default FormField;
