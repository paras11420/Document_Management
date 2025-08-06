import { useEffect, useState } from "react";
import axios from "axios";

function Report() {
  const [summary, setSummary] = useState([]);
  const [details, setDetails] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    departmentId: "",
    from: "",
    to: "",
    search: "",
  });

  useEffect(() => {
    // Department Summary
    axios
      .get("http://localhost:8080/api/reports/department-summary")
      .then((res) => setSummary(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Failed to fetch summary", err);
        setSummary([]);
      });

    // Departments List
    axios
      .get("http://localhost:8080/api/document/departments")
      .then((res) => setDepartments(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Failed to fetch departments", err);
        setDepartments([]);
      });
  }, []);

  const handleFilter = () => {
    const params = { ...filters };
    Object.keys(params).forEach((key) => {
      if (!params[key]) delete params[key]; // remove empty filters
    });

    axios
      .get("http://localhost:8080/api/reports/document-details", { params })
      .then((res) => setDetails(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Failed to fetch details", err);
        setDetails([]);
      });
  };

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl text-center font-bold text-gray-800">
        📊 Reports
      </h1>

      {/* Department Summary */}
      <section>
        <h2 className="text-xl font-semibold mb-2">
          Department Document Summary
        </h2>
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Department</th>
              <th className="p-2 text-left">Document Count</th>
              <th className="p-2 text-left">Last Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {summary.length > 0 ? (
              summary.map((s, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{s.department}</td>
                  <td className="p-2">{s.documentCount}</td>
                  <td className="p-2">
                    {new Date(s.lastUploaded).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-2 text-center text-gray-500">
                  No summary data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Filtered Document Details */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Document Details</h2>

        <div className="flex flex-wrap items-center gap-4 mb-4">
          <select
            value={filters.departmentId}
            onChange={(e) =>
              setFilters({ ...filters, departmentId: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Search title..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="border p-2 rounded"
          />

          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>

        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Department</th>
              <th className="p-2 text-left">File</th>
              <th className="p-2 text-left">Uploaded At</th>
              <th className="p-2 text-left">Download</th>
            </tr>
          </thead>
          <tbody>
            {details.length > 0 ? (
              details.map((doc, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{doc.title}</td>
                  <td className="p-2">{doc.department}</td>
                  <td className="p-2">{doc.fileName}</td>
                  <td className="p-2">
                    {new Date(doc.uploadedAt).toLocaleString()}
                  </td>
                  <td className="p-2">
                    <a
                      href={doc.downloadUrl}
                      className="text-blue-600 underline"
                      download
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-2 text-center text-gray-500">
                  No documents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Report;
