import { useState, useEffect } from "react";
import UploadQuerySection from "../components/UploadQuerySection";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  // Authentication state (mock)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Redirect if not authenticated
  useEffect(() => {
    const token = localStorage.getItem("idToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Search parameters
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [minBirdCount, setMinBirdCount] = useState<number>(1);
  const [fileType, setFileType] = useState<string>("all");

  // Results
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);



  // Mock bird species for dropdown
  const birdSpeciesList = [
    "American Robin",
    "Blue Jay",
    "Northern Cardinal",
    "Barn Swallow",
    "Red-tailed Hawk",
    "Great Blue Heron",
    "Bald Eagle",
    "Mallard Duck",
    "Mourning Dove",
    "House Sparrow",
    "European Starling",
    "American Goldfinch",
  ];

  // Mock search results
  const mockResults = [
    {
      id: 1,
      type: "image",
      preview:
        "https://readdy.ai/api/search-image?query=A%20beautiful%20high-resolution%20photograph%20of%20an%20American%20Robin%20perched%20on%20a%20branch%20with%20a%20blurred%20natural%20green%20background%2C%20morning%20light%2C%20professional%20wildlife%20photography%2C%20detailed%20feathers%2C%20bird%20watching%2C%20nature%20photography&width=400&height=300&seq=1&orientation=landscape",
      species: ["American Robin"],
      count: 2,
      timestamp: "2025-06-01T14:32:00Z",
    },
    {
      id: 2,
      type: "audio",
      preview: "",
      species: ["Blue Jay", "Northern Cardinal"],
      count: 3,
      timestamp: "2025-06-03T09:15:00Z",
    },
    {
      id: 3,
      type: "video",
      preview:
        "https://readdy.ai/api/search-image?query=A%20beautiful%20high-resolution%20photograph%20of%20a%20Blue%20Jay%20in%20flight%20with%20wings%20spread%20against%20a%20clear%20blue%20sky%2C%20vibrant%20blue%20feathers%2C%20professional%20wildlife%20photography%2C%20detailed%20plumage%2C%20bird%20watching%2C%20nature%20photography&width=400&height=300&seq=2&orientation=landscape",
      species: ["Blue Jay"],
      count: 1,
      timestamp: "2025-06-04T16:45:00Z",
    },
    {
      id: 4,
      type: "image",
      preview:
        "https://readdy.ai/api/search-image?query=A%20beautiful%20high-resolution%20photograph%20of%20a%20Northern%20Cardinal%20with%20bright%20red%20feathers%20perched%20on%20a%20snow-covered%20branch%2C%20winter%20scene%2C%20professional%20wildlife%20photography%2C%20detailed%20plumage%2C%20bird%20watching%2C%20nature%20photography&width=400&height=300&seq=3&orientation=landscape",
      species: ["Northern Cardinal"],
      count: 4,
      timestamp: "2025-06-02T11:20:00Z",
    },
    {
      id: 5,
      type: "audio",
      preview: "",
      species: ["Barn Swallow", "House Sparrow"],
      count: 5,
      timestamp: "2025-06-05T08:30:00Z",
    },
    {
      id: 6,
      type: "image",
      preview:
        "https://readdy.ai/api/search-image?query=A%20beautiful%20high-resolution%20photograph%20of%20a%20Red-tailed%20Hawk%20soaring%20in%20the%20sky%20with%20wings%20fully%20extended%2C%20golden%20sunset%20light%2C%20professional%20wildlife%20photography%2C%20detailed%20feathers%2C%20bird%20watching%2C%20nature%20photography&width=400&height=300&seq=4&orientation=landscape",
      species: ["Red-tailed Hawk"],
      count: 1,
      timestamp: "2025-06-01T15:10:00Z",
    },
    {
      id: 7,
      type: "video",
      preview:
        "https://readdy.ai/api/search-image?query=A%20beautiful%20high-resolution%20photograph%20of%20a%20Great%20Blue%20Heron%20wading%20in%20shallow%20water%2C%20hunting%20for%20fish%2C%20misty%20morning%20light%2C%20professional%20wildlife%20photography%2C%20detailed%20feathers%2C%20bird%20watching%2C%20nature%20photography&width=400&height=300&seq=5&orientation=landscape",
      species: ["Great Blue Heron"],
      count: 2,
      timestamp: "2025-06-03T07:25:00Z",
    },
    {
      id: 8,
      type: "image",
      preview:
        "https://readdy.ai/api/search-image?query=A%20beautiful%20high-resolution%20photograph%20of%20a%20Bald%20Eagle%20perched%20majestically%20on%20a%20tree%20branch%20overlooking%20a%20lake%2C%20dramatic%20cloudy%20sky%2C%20professional%20wildlife%20photography%2C%20detailed%20feathers%2C%20bird%20watching%2C%20nature%20photography&width=400&height=300&seq=6&orientation=landscape",
      species: ["Bald Eagle"],
      count: 1,
      timestamp: "2025-06-04T12:40:00Z",
    },
  ];

  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [operation, setOperation] = useState<1 | 0>(1);

  const handleSubmit = async () => {
    const tags = tagInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const body = {
      url: selectedUrls,
      operation,
      tags,
    };

    const res = await fetch('/api/update-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert('Tag operation succeeded');
      setSelectedUrls([]);
      setTagInput('');
    } else {
      alert('Failed to update tags');
    }
  };
  // Handle search
  const handleSearch = () => {
    setIsLoading(true);
    setHasSearched(true);

    // Simulate API call
    setTimeout(() => {
      let results = [...mockResults];

      // Filter by species if selected
      if (selectedSpecies.length > 0) {
        results = results.filter((item) =>
          item.species.some((species) => selectedSpecies.includes(species)),
        );
      }

      // Filter by minimum bird count
      if (minBirdCount > 1) {
        results = results.filter((item) => item.count >= minBirdCount);
      }

      // Filter by file type
      if (fileType !== "all") {
        results = results.filter((item) => item.type === fileType);
      }

      setSearchResults(results);
      setIsLoading(false);
    }, 1000);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle species selection
  const toggleSpecies = (species: string) => {
    if (selectedSpecies.includes(species)) {
      setSelectedSpecies(selectedSpecies.filter((item) => item !== species));
    } else {
      setSelectedSpecies([...selectedSpecies, species]);
    }
  };

  const handleDeleteFiles = async () => {
    const confirm = window.confirm("Are you sure you want to delete these files?");
    if (!confirm) return;

    try {
      const response = await fetch("https://your-api-url/prod/delete-files", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${idToken}`, 
        },
        body: JSON.stringify({
          urls: selectedUrls,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete files");

      alert("Files deleted successfully!");
      
      setSearchResults((prev) =>
        prev.filter((item) => !selectedUrls.includes(item.url))
      );
      setSelectedUrls([]); 
    } catch (err) {
      console.error(err);
      alert("Error deleting files.");
    }
  };

  return (
     <div className="min-h-screen bg-gray-50">
      {/* Header & Authentication Section */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              Bird Media Search
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Search Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bird Species Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bird Species Tags
              </label>
              <div className="relative">
                <div className="flex flex-wrap gap-2 p-2 min-h-[42px] border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                  {selectedSpecies.map((species) => (
                    <div
                      key={species}
                      className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center"
                    >
                      <span>{species}</span>
                      <button
                        type="button"
                        className="ml-1 text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        onClick={() => toggleSpecies(species)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <i className="fas fa-chevron-down text-gray-400"></i>
                </div>
              </div>

              {/* Dropdown menu */}
              <div className="mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                {birdSpeciesList.map((species) => (
                  <div
                    key={species}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${selectedSpecies.includes(species) ? "bg-indigo-50" : ""}`}
                    onClick={() => toggleSpecies(species)}
                  >
                    <div className="flex items-center">
                      <span className="flex-grow">{species}</span>
                      {selectedSpecies.includes(species) && (
                        <i className="fas fa-check text-indigo-600"></i>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Select one or more bird species to filter results
              </p>
            </div>

            {/* Minimum Bird Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Bird Count
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-hashtag text-gray-400"></i>
                </div>
                <input
                  type="number"
                  min="1"
                  value={minBirdCount}
                  onChange={(e) =>
                    setMinBirdCount(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="block w-full pl-10 pr-12 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="1"
                />
                <div className="absolute inset-y-0 right-0 flex">
                  <div className="flex flex-col divide-y divide-gray-300 border-l border-gray-300">
                    <button
                      type="button"
                      className="flex-1 px-2 bg-gray-50 hover:bg-gray-100 cursor-pointer !rounded-button whitespace-nowrap"
                      onClick={() =>
                        setMinBirdCount((prev) => Math.min(99, prev + 1))
                      }
                    >
                      <i className="fas fa-chevron-up text-gray-500 text-xs"></i>
                    </button>
                    <button
                      type="button"
                      className="flex-1 px-2 bg-gray-50 hover:bg-gray-100 cursor-pointer !rounded-button whitespace-nowrap"
                      onClick={() =>
                        setMinBirdCount((prev) => Math.max(1, prev - 1))
                      }
                    >
                      <i className="fas fa-chevron-down text-gray-500 text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Minimum number of birds detected (must be more than 1)
              </p>
            </div>
          </div>

          {/* File Type Filter */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Type (Optional)
            </label>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  id="all"
                  name="fileType"
                  type="radio"
                  checked={fileType === "all"}
                  onChange={() => setFileType("all")}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label
                  htmlFor="all"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  All
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="image"
                  name="fileType"
                  type="radio"
                  checked={fileType === "image"}
                  onChange={() => setFileType("image")}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label
                  htmlFor="image"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  <i className="fas fa-image mr-1 text-gray-500"></i> Images
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="audio"
                  name="fileType"
                  type="radio"
                  checked={fileType === "audio"}
                  onChange={() => setFileType("audio")}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label
                  htmlFor="audio"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  <i className="fas fa-volume-up mr-1 text-gray-500"></i> Audio
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="video"
                  name="fileType"
                  type="radio"
                  checked={fileType === "video"}
                  onChange={() => setFileType("video")}
                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <label
                  htmlFor="video"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  <i className="fas fa-video mr-1 text-gray-500"></i> Videos
                </label>
              </div>
            </div>
          </div>
          {/* Upload Query Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Or Upload a Media File to Search
            </h2>
            <UploadQuerySection />
          </div>
          {selectedUrls.length > 0 && (
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleDeleteFiles}
            >
              Delete Selected Files
            </button>
          )}
          {selectedUrls.length > 0 && (
            <div className="mt-6 border rounded p-4 bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-2">Bulk Tag Operation</h3>

              <textarea
                className="w-full border rounded p-2 text-sm"
                rows={3}
                placeholder={`crow,1\npigeon,2`}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />

              <div className="mt-3 flex gap-4">
                <button
                  onClick={() => setOperation(1)}
                  className={`px-4 py-2 rounded ${operation === 1 ? 'bg-blue-600 text-white' : 'border'}`}
                >
                  Add Tags
                </button>
                <button
                  onClick={() => setOperation(0)}
                  className={`px-4 py-2 rounded ${operation === 0 ? 'bg-red-600 text-white' : 'border'}`}
                >
                  Remove Tags
                </button>
                <button
                  onClick={handleSubmit}
                  className="ml-auto px-4 py-2 bg-green-600 text-white rounded"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Search Button */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 !rounded-button whitespace-nowrap cursor-pointer"
            >
              <i className="fas fa-search mr-2"></i>
              Search
            </button>
          </div>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Search Results
                {!isLoading && searchResults.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({searchResults.length} items found)
                  </span>
                )}
              </h2>

              {/* View Toggle */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md ${viewMode === "grid" ? "bg-gray-200 text-gray-800" : "text-gray-500 hover:bg-gray-100"} !rounded-button whitespace-nowrap cursor-pointer`}
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md ${viewMode === "list" ? "bg-gray-200 text-gray-800" : "text-gray-500 hover:bg-gray-100"} !rounded-button whitespace-nowrap cursor-pointer`}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="mt-4 text-gray-600">
                  Searching for bird media...
                </p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 text-6xl mb-4">
                  <i className="fas fa-search"></i>
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No results found
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  Try adjusting your search parameters or selecting different
                  bird species.
                </p>
              </div>
            )}

            {/* Grid View */}
            {!isLoading && searchResults.length > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((result) => (
                 
                  <div
                    key={result.id}
                    className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <input
                      type="checkbox"
                      className="absolute top-2 left-2"
                      checked={selectedUrls.includes(result.preview)}
                      onChange={() => {
                        if (selectedUrls.includes(result.preview)) {
                          setSelectedUrls(selectedUrls.filter((url) => url !== result.preview));
                        } else {
                          setSelectedUrls([...selectedUrls, result.preview]);
                        }
                      }}
                    />
                    {/* Media Preview */}
                    <div className="h-48 bg-gray-100">

                      {/* Preview Content */}
                      {result.type === "image" && (
                        <img
                          src={result.preview}
                          alt={`${result.species.join(", ")}`}
                          className="w-full h-full object-cover object-top"
                        />
                      )}

                      {result.type === "audio" && (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-4xl text-indigo-500">
                            <i className="fas fa-volume-up"></i>
                          </div>
                        </div>
                      )}

                      {result.type === "video" && (
                        <div className="relative w-full h-full">
                          <img
                            src={result.preview}
                            alt={`${result.species.join(", ")}`}
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-50 rounded-full p-3">
                              <i className="fas fa-play text-white"></i>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      {/* Species Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {result.species.map((species: string) => (
                          <span
                            key={species}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {species}
                          </span>
                        ))}
                      </div>

                      {/* Bird Count */}
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <i className="fas fa-crow mr-1"></i>
                        <span>
                          {result.count} {result.count === 1 ? "bird" : "birds"}{" "}
                          detected
                        </span>
                      </div>

                      {/* Timestamp */}
                      <div className="text-xs text-gray-500 mb-3">
                        <i className="far fa-calendar-alt mr-1"></i>
                        {formatDate(result.timestamp)}
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 !rounded-button whitespace-nowrap cursor-pointer"
                      >
                        {result.type === "image" && (
                          <>
                            <i className="fas fa-eye mr-1"></i>
                            View Full Image
                          </>
                        )}
                        {result.type === "audio" && (
                          <>
                            <i className="fas fa-play mr-1"></i>
                            Play Audio
                          </>
                        )}
                        {result.type === "video" && (
                          <>
                            <i className="fas fa-play mr-1"></i>
                            Play Video
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {!isLoading && searchResults.length > 0 && viewMode === "list" && (
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Media
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Species
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Bird Count
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((result, index) => (
                      <tr
                        key={result.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 relative bg-gray-100 rounded overflow-hidden">
                              {result.type === "image" && (
                                <img
                                  src={result.preview}
                                  alt={`${result.species.join(", ")}`}
                                  className="h-full w-full object-cover object-top"
                                />
                              )}

                              {result.type === "audio" && (
                                <div className="flex items-center justify-center h-full">
                                  <i className="fas fa-volume-up text-indigo-500"></i>
                                </div>
                              )}

                              {result.type === "video" && (
                                <div className="relative h-full w-full">
                                  <img
                                    src={result.preview}
                                    alt={`${result.species.join(", ")}`}
                                    className="h-full w-full object-cover object-top"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black bg-opacity-50 rounded-full p-1">
                                      <i className="fas fa-play text-white text-xs"></i>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {result.type.charAt(0).toUpperCase() +
                                  result.type.slice(1)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {result.species.map((species: string) => (
                              <span
                                key={species}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {species}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {result.count}{" "}
                            {result.count === 1 ? "bird" : "birds"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(result.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            className="text-indigo-600 hover:text-indigo-900 mr-4 !rounded-button whitespace-nowrap cursor-pointer"
                          >
                            <i className="fas fa-download mr-1"></i>
                            Download
                          </button>
                          <button
                            type="button"
                            className="text-indigo-600 hover:text-indigo-900 !rounded-button whitespace-nowrap cursor-pointer"
                          >
                            <i className="fas fa-eye mr-1"></i>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;