import React, { useState, useMemo } from "react";
import Input from "./Input";
import { Search } from "lucide-react";
import Button from "./Button";
import Loader from "../Loader/Loader";

export default function Table({
  tableTitle,
  columns,
  data,
  loading,
  showSearch = true,
  showExport = true,
  hideHeaderGap = false,
  headerActions = null,
  headerFilters = null,
  exportFileName = "Clients_Table.csv"
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
const [recordsPerPage, setRecordsPerPage] = useState(20);


  // ✅ Filter data by search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(lowerSearch)
      )
    );
  }, [data, searchTerm]);

 



  // ✅ Pagination logic
  const totalRecords = filteredData?.length || 0;

const totalPages = Math.ceil(totalRecords / recordsPerPage);

const startIndex = (currentPage - 1) * recordsPerPage;
const endIndex = startIndex + recordsPerPage;

const currentData = filteredData?.slice(startIndex, endIndex) || [];

const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
};

const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
};

  const exportTableToCSV = (tableType = "Client Details") => {
    if (!currentData || !currentData.length) return;

    // ----------- DATE FOR FILENAME -----------
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    const filename = `${tableType} - ${formattedDate}.csv`;


    // ----------- STATUS CHECK -----------
    const tableHasStatus = columns.some(
      (col) => (col.accessor || "").toLowerCase() === "status"
    );


    // ----------- STATUS CALCULATOR -----------
    const getExpiryStatus = (toDate) => {
      if (!toDate) return ""; // No status if table doesn't have to_date

      const today = new Date();
      const expiry = new Date(toDate);

      today.setHours(0, 0, 0, 0);
      expiry.setHours(0, 0, 0, 0);

      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return "Expired";
      if (diffDays <= 7) return "Expiring";
      return "Active";
    };


    // ----------- COLUMN EXCLUSION -----------


    const getHeaderText = (header) => {
      // If header is a plain string → return
      if (typeof header === "string") return header;

      // If header is a number → convert to string
      if (typeof header === "number") return String(header);

      // If header is a JSX element → extract text
      if (typeof header === "object" && header.props?.children) {
        const child = header.props.children;

        // If children is an array → join text nodes only
        if (Array.isArray(child)) {
          return child
            .filter((c) => typeof c === "string" || typeof c === "number")
            .join(" ")
            .trim();
        }

        // Single child case
        if (typeof child === "string" || typeof child === "number") {
          return String(child).trim();
        }
      }

      // Fallback
      return "";
    };



    const exportColumns = columns.filter((col) => {
      const acc = String(col.accessor || "").toLowerCase().trim();
      const head = getHeaderText(col.header).toLowerCase().trim();

      // STRICT SR NO REMOVAL — PREVENT DOUBLE SR NO
      const isSrColumn =
        acc === "srno" ||
        acc === "sr_no" ||
        acc === "sr" ||
        acc === "sr no" ||
        acc === "serial" ||
        head === "sr no" ||
        head === "sr. no" ||
        head === "serial no";

      if (isSrColumn) return false;

      // Remove other unwanted columns
      if (acc.includes("action") || acc.includes("renew") || acc.includes("update")) return false;
      if (acc.includes("attendance")) return false;

      // status will be added manually
      if (acc === "status") return false;

      return true;
    });




    // ----------- HEADER CREATION -----------
    const headers = [
      "Sr No",
      ...exportColumns.map((col) => getHeaderText(col.header)),


    ];

    if (tableHasStatus) {
      headers.push("Status");
    }


    // ----------- ROW CREATION -----------
    const csvRows = [
      headers.join(","),

      ...currentData.map((row, index) => {
        const rowData = [
          index + 1, // SR. NO ONLY ONCE
          ...exportColumns.map((col) => {
            let value = row[col.accessor];

            if (typeof value === "object") value = "";
            if (value === undefined || value === null) value = "";

            const acc = col.accessor.toLowerCase();

            // AMOUNT FIX
            if (acc.includes("amount") || acc.includes("fee")) {
              const num = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
              value = isNaN(num) ? "" : `₹ ${num.toFixed(2)}`;
            }

            // MOBILE FIX
            if (acc.includes("mobile")) {
              value = value ? `${value}` : "";
            }

            // DATE FIX
            if (acc.includes("date")) {
              value = String(value).split("T")[0];
            }

            return `"${String(value).replace(/"/g, '""')}"`;
          }),
        ];

        // Add STATUS only if table has status or to_date
        if (tableHasStatus) {
          rowData.push(`"${getExpiryStatus(row.to_date)}"`);
        }

        return rowData.join(",");
      }),
    ];


    // ----------- CSV GENERATION -----------
    const csvString = csvRows.join("\n");

    const blob = new Blob(["\uFEFF" + csvString], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };


  return (
    <div className="relative border border-gray-200 rounded-lg overflow-hidden shadow-sm">

      {/* 🔹 Sticky Header: Title + Search */}
      <div
        className={`sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm gap-5 ${hideHeaderGap ? "mb-0" : "mb-5"
          }`}
      >
        <div
          className={`grid grid-cols-1 ${hideHeaderGap ? "p-0" : "p-4"
            }
  md:grid-cols-1
  lg:grid-cols-[auto_1fr_auto]
  lg:items-center`}
        >
          {/* ================= ROW 1 ================= */}
          <div
            className="
        flex flex-wrap items-center gap-3

      /* TABLET */
        md:flex-row md:items-center md:justify-between sm:justify-center

        /* Desktop alignment */
        lg:contents 
      "
          >
            {/* TITLE */}
            <h1 >
              { }
            </h1>

            {/* ================= FILTERS ================= */}
            {headerFilters && (
              <div
                className="
          flex flex-wrap gap-1
          md:col-span-2 md:justify-start

          /* Desktop: center column */  
          lg:col-span-1 lg:justify-center
        "
              >
                {headerFilters}
              </div>
            )}

            {/* STATUS BUTTONS */}

          </div>

          {/* ================= ROW 2 ================= */}

          {/* ================= ROW 2 ================= */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full">

            {/* Left side - Search + Export CSV */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">

              {/* Search */}
              {showSearch && (
                <div className="w-full sm:w-64 md:w-72 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 text-sm w-full"
                  />
                </div>
              )}

              {/* Export CSV */}
              {showExport && (
                <Button
                  variant="success"
                  onClick={() => exportTableToCSV(exportFileName)}
                  className="px-6 py-2 text-sm whitespace-nowrap text-white w-full sm:w-auto"
                >
                  Export CSV
                </Button>
              )}

            </div>

            {/* Right side - Add Enquiry */}
            <div className="w-full md:w-auto flex justify-start md:justify-end">
              {headerActions}
            </div>

          </div>
        </div>

      </div>

      {/* 🔹 Scrollable Table Container */}
      <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
        <table className="min-w-full border-collapse divide-y divide-gray-200">

          <thead className="bg-black sticky top-[0rem] z-10">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-sm font-semibold text-[#ffffff] uppercase tracking-wider whitespace-nowrap border-b border-gray-300"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

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
            ) : currentData.length === 0 ? (
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
                  key={rowIndex}
                  className="hover:bg-gray-50 transition"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-2 text-sm"
                    >
                      {col.cell
                        ? col.cell(row)
                        : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>


        </table>
      </div>

      {/* 🔹 Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between mt-3 px-4 py-2 bg-gray-50 border-t border-gray-200 sticky bottom-0">

          {/* Previous */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
              }`}
          >
            Previous
          </button>

          {/* Range Dropdown */}
          <div className="relative">

            <button
              onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
              className="px-4 py-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {pageRanges[currentPage - 1]?.label} ▼
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
                    className={`block w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${currentPage === range.page
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

          {/* Next */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === totalPages
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
