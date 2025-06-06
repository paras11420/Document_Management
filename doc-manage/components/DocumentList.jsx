import { useEffect, useState } from "react";
import axios from "axios";

function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "http://localhost:5186/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchDocuments(), fetchDepartments()]);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [searchTerm, documents, selectedDept, sortOrder]);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/document`);
      setDocuments(res.data);
    } catch (err) {
      setError("Failed to load documents");
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/document/departments`);
      setDepartments(res.data);
    } catch (err) {
      setError("Failed to load departments");
    }
  };

  const filterDocuments = () => {
    let docs = [...documents];

    if (searchTerm) {
      docs = docs.filter((doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDept) {
      docs = docs.filter((doc) => doc.departmentName === selectedDept);
    }

    docs.sort((a, b) =>
      sortOrder === "asc"
        ? new Date(a.uploadedAt) - new Date(b.uploadedAt)
        : new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );

    setFilteredDocs(docs);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/document/${id}`);
      await fetchDocuments();
    } catch (err) {
      alert("Failed to delete document.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Document List</h2>

      {/* Error or Loading */}
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by title"
              className="p-2 border rounded w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="p-2 border rounded"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            <select
              className="p-2 border rounded"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Document Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-center">
                  <th className="border px-4 py-2">Title</th>
                  <th className="border px-4 py-2">Department</th>
                  <th className="border px-4 py-2">Date</th>
                  <th className="border px-4 py-2">Download</th>
                  <th className="border px-4 py-2">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="text-center">
                      <td className="border px-4 py-2">{doc.title}</td>
                      <td className="border px-4 py-2">
                        {doc.departmentName || "N/A"}
                      </td>
                      <td className="border px-4 py-2">
                        {doc.uploadedAt
                          ? new Date(doc.uploadedAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="border px-4 py-2">
                        <a
                          href={`${API_BASE}/document/download/${doc.id}`}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default DocumentList;
