import React, { useState } from "react";

export default function Table2({
  columns = [],
  data = [],
  loading = false,
  tableTitle = "",
  headerActions = null,
}) {
  // ================= PAGINATION =================
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ================= TOTAL PAGES =================
  const totalPages = Math.ceil((data?.length || 0) / recordsPerPage);

  // ================= CURRENT DATA =================
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;

  const currentData = data?.slice(startIndex, endIndex);

  // ================= PAGE CHANGE =================
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden shadow-sm">

      {/* HEADER */}
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">
          {tableTitle}
        </h2>

        <div>
          {headerActions}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto overflow-y-auto min-h-[300px] max-h-[60vh]">
        <table className="min-w-full border-collapse divide-y divide-gray-200">

          {/* TABLE HEADER */}
          <thead className="bg-black">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-sm font-semibold text-[#ffffff] uppercase tracking-wider whitespace-nowrap border-b border-gray-300"
                  style={{
                    position: col.sticky ? "sticky" : "sticky",
                    left: col.sticky ? col.left : "auto",
                    top: "0px",
                    zIndex: col.sticky ? 50 : 40,
                    background: "black",
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10"
                >
                  Loading...
                </td>
              </tr>
            ) : currentData?.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-500"
                >
                  No Data Found
                </td>
              </tr>
            ) : (
              currentData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className="hover:bg-gray-50 transition"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-2 text-sm"
                      style={{
                        position: col.sticky ? "sticky" : "static",
                        left: col.sticky ? col.left : "auto",
                        zIndex: col.sticky ? 40 : 1,
                        background: "#ffffff",
                      }}
                    >
                      {row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">

          {/* ROWS PER PAGE */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Rows per page:</span>

            <select
              value={recordsPerPage}
              onChange={(e) => {
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-2 py-1 bg-white outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* TOTAL COUNT */}
          <div className="text-sm text-gray-600">
            {data.length === 0
              ? "0"
              : `${(currentPage - 1) * recordsPerPage + 1}-${Math.min(
                currentPage * recordsPerPage,
                data.length
              )}`}{" "}
            of {data.length}
          </div>

          {/* PAGE NAVIGATION */}
          <div className="flex items-center gap-1">

            {/* PREVIOUS */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-md border text-sm font-medium ${currentPage === 1
                  ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
            >
              Prev
            </button>

            {/* CURRENT PAGE / TOTAL PAGES */}
            <span className="px-3 py-1.5 text-sm font-medium text-gray-700">
              {currentPage}/{totalPages}
            </span>

            {/* NEXT */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-md border text-sm font-medium ${currentPage === totalPages
                  ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
            >
              Next
            </button>

          </div>
        </div>
      )}
    </div>
  );
}