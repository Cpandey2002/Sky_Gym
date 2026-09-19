import React from "react";

export default function Table2({
  columns = [],
  data = [],
  loading = false,
  tableTitle = "",
  headerActions = null
}) {

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
                  key={index} px-4 py-3 text-left te
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

            ) : data.length === 0 ? (

              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-500"
                >
                  No Data Found
                </td>
              </tr>

            ) : (

              data.map((row, rowIndex) => (

                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 transition" >

                  {columns.map((col, colIndex) => (

                    <td
                      key={colIndex}
                      className="px-4 py-2 text-sm "
                      style={{
                        position: col.sticky ? "sticky" : "static",
                        left: col.sticky ? col.left : "auto",
                        zIndex: col.sticky ? 40 : 1,
                        background: col.sticky ? "#ffffff" : "#ffffff"
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

    </div>

  );

}
