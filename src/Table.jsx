import { useQuery } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import sampleData from './data/mock.json';

const fetchData = async () => {
  return sampleData;
};

const columnsData = [
  {
    accessorKey: 'UsageDate',
    header: 'Date',
  },
  {
    header: 'Usage',
    columns: [
      { accessorKey: 'Usage.Commodity', header: 'Commodity' },
      { accessorKey: 'Usage.Transport', header: 'Transport' },
      { accessorKey: 'Usage.Baseline', header: 'Baseline' },
      { accessorKey: 'Usage.WeatherNormalized', header: 'Weather Normalized' },
      { accessorKey: 'Usage.Budget', header: 'Budget' }
    ]
  },
  {
    header: 'Cost ($)',
    columns: [
      { accessorKey: 'Cost.TotalCommodity', header: 'Total Commodity' },
      { accessorKey: 'Cost.Supply', header: 'Supply' },
      { accessorKey: 'Cost.Transmission', header: 'Transmission' },
      { accessorKey: 'Cost.Capacity', header: 'Capacity' },
      { accessorKey: 'Cost.TotalTransport', header: 'Total Transport' },
      { accessorKey: 'Cost.Tariff', header: 'Tariff' },
      { accessorKey: 'Cost.4CPNCP', header: '4CP NCP' },
      { accessorKey: 'Cost.BillingDemand', header: 'Billing Demand' },
      { accessorKey: 'Cost.Taxes', header: 'Taxes' },
      { accessorKey: 'Cost.Other', header: 'Other' },
      { accessorKey: 'Cost.Total', header: 'Total' },
      { accessorKey: 'Cost.Baseline', header: 'Baseline' },
      { accessorKey: 'Cost.Budget', header: 'Budget' }
    ]
  },
  {
    header: 'Demand',
    columns: [
      { accessorKey: 'Demand.Actual', header: 'Actual' },
      { accessorKey: 'Demand.Bill', header: 'Bill' }
    ]
  },
  {
    header: 'Weather',
    columns: [
      { accessorKey: 'Weather.HDD', header: 'HDD' },
      { accessorKey: 'Weather.CDD', header: 'CDD' }
    ]
  }
];

export default function Table() {
  const [showLoader, setShowLoader] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [visibleColumns, setVisibleColumns] = useState(() =>
    columnsData.reduce((acc, column) => {
      if (column.columns) {
        column.columns.forEach((subColumn) => (acc[subColumn.accessorKey] = true));
      } else {
        acc[column.accessorKey] = true;
      }
      return acc;
    }, {})
  );

  const { data = [], isLoading: queryLoading } = useQuery({
    queryKey: ['tableData'],
    queryFn: fetchData,
  });

  useEffect(() => {
    if (!queryLoading) {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(true);
    }
  }, [queryLoading]);

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setPagination({ pageIndex: 0, pageSize: newSize });
    setShowLoader(true);
    setTimeout(() => setShowLoader(false), 500);
  };

  const table = useReactTable({
    data,
    columns: columnsData.filter((col) =>
      col.columns
        ? col.columns.some((subCol) => visibleColumns[subCol.accessorKey])
        : visibleColumns[col.accessorKey]
    ).map((col) =>
      col.columns
        ? {
            ...col,
            columns: col.columns.filter((subCol) => visibleColumns[subCol.accessorKey]),
          }
        : col
    ),
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  const toggleColumnVisibility = (columnId) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const totalPages = table.getPageCount();
  const currentPage = pagination.pageIndex + 1;

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <div className="relative">
      {showLoader && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-40 backdrop-blur z-20">
          <div className="loader"></div>
          <p className="mt-4 text-gray-700">Loading report...</p>
        </div>
      )}

      <div className="mb-4 p-4 bg-gray-50 border rounded-md">
        <h2 className="font-semibold mb-2">Column Visibility</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {columnsData.map((col) =>
            col.columns ? (
              <div key={col.header} className="flex flex-col">
                <h3 className="font-semibold text-sm mb-1">{col.header}</h3>
                {col.columns.map((subCol) => (
                  <label key={subCol.accessorKey} className="flex items-center space-x-2 mb-1">
                    <input
                      type="checkbox"
                      checked={visibleColumns[subCol.accessorKey]}
                      onChange={() => toggleColumnVisibility(subCol.accessorKey)}
                      className="form-checkbox text-blue-600"
                    />
                    <span>{subCol.header}</span>
                  </label>
                ))}
              </div>
            ) : (
              <label key={col.accessorKey} className="flex items-start space-x-2 mb-1">
                <input
                  type="checkbox"
                  checked={visibleColumns[col.accessorKey]}
                  onChange={() => toggleColumnVisibility(col.accessorKey)}
                  className="form-checkbox text-blue-600"
                />
                <span>{col.header}</span>
              </label>
            )
          )}
        </div>
      </div>

      <div className="overflow-x-auto border-gray-300 rounded-lg">
        <div className="overflow-y-auto max-h-[550px]">
          <table className="table-auto w-full border border-gray-300 rounded-lg">
            <thead className="bg-[#F0F4F9] text-[#34475F] overflow-hidden">
              {table.getHeaderGroups().map((headerGroup, rowIndex) => (
                <tr key={headerGroup.id} className='rounded-lg'>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`px-4 py-2 border border-gray-300 ${
                        header.column.columnDef.header === 'Date' || header.depth === 0
                          ? 'sticky left-0 z-10 bg-[#F0F4F9]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <tr key={row.id} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#E2EAF3]'}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-2 border ${
                        cell.column.id === 'UsageDate' ? 'sticky left-0 bg-white z-10' : ''
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination flex justify-between items-center py-2 mt-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="pageSize" className="text-gray-700">Rows per page:</label>
          <select
            id="pageSize"
            value={pagination.pageSize}
            onChange={handlePageSizeChange}
            className="border rounded px-2 py-1"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setPagination((prev) => ({ ...prev, pageIndex: pageNum - 1 }))}
              className={`px-3 py-1 border rounded ${
                pageNum === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
