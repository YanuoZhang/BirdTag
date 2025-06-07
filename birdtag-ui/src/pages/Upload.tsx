import React, { useState, useCallback } from "react";   
const Upload = () => {
    const idToken = localStorage.getItem("idToken");
    console.log(idToken)
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [tags, setTags] = useState<string[]>([]);
    const [preview, setPreview] = useState<string>("");

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length) {
        handleFileSelect(files[0]);
        }
    }, []);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          handleFileSelect(e.target.files[0]);
        }
    };
    const handleUpload = async () => {
      if (!selectedFile) return;

      try {
        const res = await fetch("https://8yasbalx94.execute-api.ap-southeast-2.amazonaws.com/prod/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}` || "",
          },
          body: JSON.stringify({
            filename: selectedFile.name,
            contentType: selectedFile.type, // e.g., "audio/wav"
          }),
        });

        if (!res.ok) throw new Error("Failed to get upload URL");

        const { url, key, contentType } = await res.json(); 
        console.log(""+url+"")
        console.log(selectedFile.type)
        console.log(key)
        const uploadRes = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": contentType,
            "x-amz-acl": "bucket-owner-full-control",
            "Authorization": `Bearer ${idToken}` || "",
          },
          body: selectedFile,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload to S3");

        alert("Upload success!");

      } catch (err) {
        console.error("Upload failed:", err);
        alert("Upload failed: " + (err as any).message);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-3xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Upload Files
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your files or click to browse
            </p>
          </div>

          <div
            className={`mt-8 border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ease-in-out cursor-pointer
              ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <input
              id="fileInput"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/jpg,video/mp4,audio/wav"
            />
            <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">
              {selectedFile
                ? selectedFile.name
                : "Drop your files here or click to browse"}
            </p>
          </div>

          {preview && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Preview</h3>
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="mt-6">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      Uploading
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {uploadProgress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                  <div
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {tags.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium !rounded-button text-white 
              ${
                selectedFile
                  ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  : "bg-gray-300 cursor-not-allowed"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap`}
          >
            Upload File
          </button>
        </div>
      </div>)
}

export default Upload