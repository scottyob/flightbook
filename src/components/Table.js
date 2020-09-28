import React, { useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import styled from "styled-components";
import { useTable, usePagination } from "react-table";
const jq = require("jq-web");

const Styles = styled.div`
  padding: 1rem;
  table {
    border-spacing: 0;
    border: 1px solid black;
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }
    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      :last-child {
        border-right: 0;
      }
    }
  }
  .pagination {
    padding: 0.5rem;
  }
`;

// Let's add a fetchData method to our Table component that will be used to fetch
// new data when pagination state changes
// We can also add a loading state to let our table know it's loading new data
function Table({
  columns,
  data,
  fetchData,
  loading,
  pageCount: controlledPageCount,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    // Get the state from the instance
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 }, // Pass our hoisted table state
      manualPagination: true, // Tell the usePagination
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own
      // pageCount.
      pageCount: controlledPageCount,
    },
    usePagination
  );

  // Listen for changes in pagination and use the state to fetch our new data
  React.useEffect(() => {
    fetchData({ pageIndex, pageSize });
  }, [fetchData, pageIndex, pageSize]);

  // Render the UI for your table
  return (
    <>
      <pre>
        <code>
          {JSON.stringify(
            {
              pageIndex,
              pageSize,
              pageCount,
              canNextPage,
              canPreviousPage,
            },
            null,
            2
          )}
        </code>
      </pre>
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
          <tr>
            {loading ? (
              // Use our custom loading state to show a loading indicator
              <td colSpan="10000">Loading...</td>
            ) : (
              <td colSpan="10000">
                Showing {page.length} of ~{controlledPageCount * pageSize}{" "}
                results
              </td>
            )}
          </tr>
        </tbody>
      </table>
      {/* 
        Pagination can be built however you'd like. 
        This is just a very basic UI implementation:
      */}
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Go to page:{" "}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 40, 80, 200].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}

const GraphqlTable = (props) => {
  //TODO:  Pagination
  //
  // Perform the query
  const [size, setSize] = useState(props.perPage || 10);

  const { data, error, loading } = useQuery(props.query, {
    variables: {
      size: size,
    },
  });

  // Extract fields from GraphQL query
  const jq_query =
    '[ .definitions[0] | recurse(.selectionSet.selections[]?) | select(.kind == "Field") | select(.selectionSet == null) ] | map(.name.value)';
  let fields = jq.json(props.query, jq_query);
  let columns = fields
    .filter((c) => {
      return c !== "_id";
    })
    .map((c) => {
      return {
        Header: c,
        accessor: c,
      };
    });

  // query name (Being lazy, only supporting one)
  const query_name_jq =
    '[ .definitions[0] | recurse(.selectionSet.selections[]?) | select(.kind == "Field") | select(.selectionSet != null) ] | map(.name.value)[0]';
  let query_name = jq.json(props.query, query_name_jq);

  const fetchData = React.useCallback(({ pageSize, pageIndex }) => {
    setSize(pageSize);
  }, []);

  if (error) {
    return <div>Error loading table: {error.message} </div>;
  }

  let table_data = (data || {})[query_name]?.data || [];
  table_data = table_data.map((d) => {
    let ret = {};

    for (var [key, value] of Object.entries(d)) {
      if (typeof value === "number" && isFinite(value)) {
        value = value.toFixed(2);
      }
      ret[key] = value;
    }
    return ret;
  });

  return (
    <Table
      columns={columns}
      data={table_data}
      fetchData={fetchData}
      loading={loading}
      pageCount={10}
    />
  );
};

export default GraphqlTable;
