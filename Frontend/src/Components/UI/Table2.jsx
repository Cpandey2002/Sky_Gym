import React, { useState, useMemo } from "react";

export default function Table2({
  columns = [],
  data = [],
  loading = false,
  tableTitle = "",
  headerActions = null
}) {
  // ================= PAGINATION =================
  const recordsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);

  // ================= PAGE RANGES =================
  const totalPages = Math.ceil((data?.length || 0) / recordsPerPage);

  const pageRanges = Array.from(
    { length: totalPages },
    (_, index) => {
      const start = index * recordsPerPage + 1;

      const end = Math.min(
        (index + 1) * recordsPerPage,
        data?.length || 0
      );

      return {
        page: index + 1,
        start,
        end,
        label: `${start}–${end}`,
      };
    }
  );

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
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">

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
                    background: "black"
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
                        background: "#ffffff"
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

        <div className="flex items-center justify-between mt-3 px-4 py-2 bg-gray-50 border-t border-gray-200 sticky bottom-0">

          {/* PREVIOUS */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            Previous
          </button>

          {/* RANGE DROPDOWN */}
          <div className="relative">

            <button
              onClick={() =>
                setIsPageDropdownOpen(!isPageDropdownOpen)
              }
              className="px-4 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {pageRanges[currentPage - 1]?.label || "1–10"} ▼
            </button>

            {isPageDropdownOpen && (

              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-28 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">

                {pageRanges.map((range) => (

                  <button
                    key={range.page}
                    onClick={() => {
                      setCurrentPage(range.page);
                      setIsPageDropdownOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                      currentPage === range.page
                        ? "bg-gray-100 font-semibold"
                        : ""
                    }`}
                  >
                    {range.label}
                  </button>

                ))}

              </div>

            )}

          </div>

          {/* NEXT */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            Next
          </button>

        </div>

      )}

    </div>
  );
}
