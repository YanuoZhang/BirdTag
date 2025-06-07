import React, { useState } from "react";

const UploadQuerySection = ({ onResult }: { onResult: (results: any[]) => void }) => {
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
          const wrappedResults = data.links.map((url: string, index: number) => ({
            id: Date.now() + index,         // 你系统需要 id
            preview: url,
            type: url.includes(".mp4") ? "video" : url.includes(".mp3") ? "audio" : "image",
            species: [],                    // 上传查询可能没有 species，可为空数组
            count: 1,
            timestamp: new Date().toISOString(),
          }));
          onResult(wrappedResults);
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
    <div className="bg-gray-50 p-6 rounded-md shadow-inner border border-dashed border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Upload a Media File
          </h3>
          <p className="text-sm text-gray-500">
            Supported: image, audio, or video file
          </p>
        </div>

        <label className="cursor-pointer inline-flex items-center text-sm font-medium text-blue-600 hover:underline">
          <i className="fas fa-folder-open mr-2"></i>
          <span>Select File</span>
          <input
            type="file"
            accept="audio/*,video/*,image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {file && (
        <div className="flex justify-between items-center border p-2 rounded bg-white text-sm mb-3">
          <span className="text-gray-700">{file.name}</span>
          <button
            onClick={handleUploadAndQuery}
            disabled={isUploading}
            className={`px-4 py-1.5 text-sm rounded-md font-medium ${
              isUploading
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {isUploading ? "Analyzing..." : "Upload & Search"}
          </button>
        </div>
      )}

      {/* error message */}
      {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
    </div>
  );
};

export default UploadQuerySection;
