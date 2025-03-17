import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [description, setDescription] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [language, setLanguage] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const availableLanguages = ['Python', 'JavaScript', 'Java', 'C++', 'C#'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneratedCode('');
    setError('');
    setLoading(true);

    if (!description || !timeComplexity || !language) {
      setError('All fields are required!');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:5000/generate', {
        input_text: description,
        timeComplexity,
        language,
      });
      setGeneratedCode(response.data.response);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while generating code.');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode)
      .then(() => {
        alert("Code copied!");
      })
      .catch(() => setError('Failed to copy the code.'));
  };

  return (
    <div className="App">
      <div className="background-pattern"></div>
      <div className="content-wrapper">
        <div className="App-container">
          <header className="App-header">
            <h1 className="title">⚡ Optimized Code Generator</h1>
            <p className="subtitle">Generate high-quality, efficient code in your favourite programming language.</p>
          </header>

          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
              <label>📝 Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter code description (e.g., Implement a binary search algorithm)"
                rows="4"
                required
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>⚡ Time Complexity</label>
              <input
                type="text"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                placeholder="e.g., O(n), O(log n)"
                required
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label>💻 Programming Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
                className="input-field"
              >
                <option value="" disabled>Select a language</option>
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="generate-button" disabled={loading}>
              {loading ? 'Generating...' : '✨ Generate Code'}
            </button>
          </form>

          {error && <div className="error">⚠️ {error}</div>}

          {generatedCode && (
            <div className="output-container">
              <h2>🚀 Generated Code</h2>
              <div className="output-wrapper">
                <textarea value={generatedCode} readOnly rows="10" className="output-textarea" />
                <button className="copy-button" onClick={handleCopy}>📋 Copy</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
