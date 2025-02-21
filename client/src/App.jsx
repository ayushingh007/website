import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Import our CSS file

const App = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Get the backend URL from environment variable or default to localhost:8000
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // When the API response is received, update the document title with the roll number
  useEffect(() => {
    if (apiResponse && apiResponse.roll_number) {
      document.title = apiResponse.roll_number;
    }
  }, [apiResponse]);

  // Handle change in the JSON input field
  const handleInputChange = (e) => {
    setJsonInput(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setApiResponse(null);
    setSelectedOptions([]);

    try {
      // Validate JSON
      const parsedInput = JSON.parse(jsonInput);
      if (!Array.isArray(parsedInput.data)) {
        setError("JSON must have a 'data' property that is an array.");
        return;
      }
      // Call the backend POST endpoint
      const response = await axios.post(`${baseURL}/bfhl`, parsedInput);
      setApiResponse(response.data);
    } catch (err) {
      setError("Invalid JSON input. Please enter valid JSON.");
    }
  };

  // Handle multi-select dropdown changes
  const handleDropdownChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedOptions(values);
  };

  return (
    <div className="container">
      <h1 className="title">BFHL Frontend</h1>
      <form onSubmit={handleSubmit} className="json-form">
        <label htmlFor="jsonInput" className="label">Enter JSON Input:</label>
        <textarea
          id="jsonInput"
          rows="5"
          className="json-input"
          value={jsonInput}
          onChange={handleInputChange}
          placeholder='{"data": ["A", "C", "z"]}'
        />
        <button type="submit" className="submit-btn">Submit</button>
      </form>
      {error && <p className="error">{error}</p>}

      {apiResponse && (
        <div className="response-container">
          <h2>API Response</h2>
          <div className="dropdown-container">
            <label htmlFor="fieldSelect" className="label">Select Fields to Display:</label>
            <select id="fieldSelect" multiple onChange={handleDropdownChange} className="multi-select">
              <option value="alphabets">Alphabets</option>
              <option value="numbers">Numbers</option>
              <option value="highest_alphabet">Highest Alphabet</option>
            </select>
          </div>
          <div className="filtered-response">
            <h3>Filtered Response</h3>
            {selectedOptions.includes("alphabets") && apiResponse.alphabets && (
              <p>
                <span className="field-label">Alphabets:</span> {apiResponse.alphabets.join(", ")}
              </p>
            )}
            {selectedOptions.includes("numbers") && apiResponse.numbers && (
              <p>
                <span className="field-label">Numbers:</span> {apiResponse.numbers.join(", ")}
              </p>
            )}
            {selectedOptions.includes("highest_alphabet") && apiResponse.highest_alphabet && (
              <p>
                <span className="field-label">Highest Alphabet:</span> {apiResponse.highest_alphabet.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
