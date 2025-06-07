import React, { useState, useEffect } from "react";
const UploadQuerySection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndQuery = async () => {
    if (!file) return;
    setIsUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Content = (reader.result as string).split(",")[1];

        const response = await fetch("https://YOUR_API/analyze-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: base64Content }),
        });

        const data = await response.json();
        if (response.ok) {
          setQueryResults(data.links || []);
        } else {
          setError(data.error || "Query failed");
        }
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError("Upload or query failed.");
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md shadow-inner">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Upload a file (audio / image / video)
      </label>
      <input
        type="file"
        accept="audio/*,video/*,image/*"
        onChange={handleFileChange}
        className="mb-3"
      />
      <button
        onClick={handleUploadAndQuery}
        disabled={!file || isUploading}
        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
      >
        {isUploading ? "Analyzing..." : "Upload & Search"}
      </button>

      {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}

      {queryResults.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Matching Files:
          </h3>
          <ul className="list-disc pl-5 text-sm text-blue-600">
            {queryResults.map((url, index) => (
              <li key={index}>
                <a href={url} target="_blank" rel="noreferrer">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadQuerySection;