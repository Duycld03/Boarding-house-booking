import { useState, useEffect } from "react";
import { Divider, Table as AntTable, Button, Select, Grid, theme } from "antd";
import PropTypes from "prop-types";
import { useTheme } from "../../context/themeContext"; // Make sure this path is correct
import { createStyles } from "antd-style";

const { Option } = Select;

// Custom styles using antd-style
const useStyle = createStyles(({ css, token, isDarkMode }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }

      /* Pagination dark mode styles */
      ${isDarkMode &&
      `
        /* Previous and Next buttons */
        ${antCls}-pagination-prev ${antCls}-pagination-item-link,
        ${antCls}-pagination-next ${antCls}-pagination-item-link {
          background-color: #2d3748 !important;
          color: #f9fafb !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Hover state for Previous and Next buttons */
        ${antCls}-pagination-prev:hover ${antCls}-pagination-item-link,
        ${antCls}-pagination-next:hover ${antCls}-pagination-item-link {
          background-color: #1f2937 !important;
          border-color: #3b82f6 !important;
          color: #ffffff !important;
        }
        
        /* Disabled state for Previous and Next buttons */
        ${antCls}-pagination-disabled ${antCls}-pagination-item-link,
        ${antCls}-pagination-disabled:hover ${antCls}-pagination-item-link {
          background-color: rgba(45, 55, 72, 0.5) !important;
          color: rgba(249, 250, 251, 0.5) !important;
          border-color: rgba(255, 255, 255, 0.05) !important;
          cursor: not-allowed;
        }
        
        /* Page number items */
        ${antCls}-pagination-item {
          background-color: #2d3748 !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        
        ${antCls}-pagination-item a {
          color: #f9fafb !important;
        }
        
        /* Active page */
        ${antCls}-pagination-item-active {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }
        
        ${antCls}-pagination-item-active a {
          color: #ffffff !important;
        }
        
        /* Dropdown for page size selection */
        ${antCls}-pagination-options ${antCls}-select-selector {
          background-color: #2d3748 !important;
          color: #f9fafb !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        
        ${antCls}-pagination-options ${antCls}-select-arrow {
          color: #f9fafb !important;
        }
        
        /* Jump to page input */
        ${antCls}-pagination-options-quick-jumper {
          color: #f9fafb !important;
        }
        
        ${antCls}-pagination-options-quick-jumper input {
          background-color: #2d3748 !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: #f9fafb !important;
        }
      `}
    `,
  };
});

const TableCustom = ({
  columns,
  data,
  checkbox = false,
  onProcessData,
  selectOptions = [],
  enableCount = true,
  loading = false,
  onRowClick,
  scrollY = null,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dynamicSelect, setDynamicSelect] = useState(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const { darkMode } = useTheme();
  const { token } = theme.useToken();

  // Use the custom styles with dark mode state
  const { styles } = useStyle({ isDarkMode: darkMode });

  const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  };

  const { useBreakpoint } = Grid;

  const screens = useBreakpoint();

  const handleSelectChange = (value) => {
    setDynamicSelect(value);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record) => ({
      name: record.name,
      disabled: false,
    }),
  };

  const handleProcessData = () => {
    const combinedData = {
      formValues: { dynamicSelect },
      selectedRows: selectedRows,
    };
    if (onProcessData && typeof onProcessData === "function") {
      onProcessData(combinedData);
    }
    setDynamicSelect(null);
    setSelectedRowKeys([]);
    setSelectedRows([]);
  };

  const numberedData = data.map((item, index) => ({
    ...item,
    number: index + 1,
  }));

  const numberedColumns = enableCount
    ? [
        {
          title: "No.",
          dataIndex: "number",
          key: "number",
          render: (_, record) => <span>{record.number}</span>,
        },
        ...columns,
      ]
    : columns;

  useEffect(() => {
    const hasSelection = selectedRows.length > 0;
    const hasValue = dynamicSelect !== null;
    setIsSubmitDisabled(!hasSelection || !hasValue);
  }, [selectedRows, dynamicSelect]);

  const onRow = (record) => ({
    onClick: () => {
      if (onRowClick && typeof onRowClick === "function") {
        onRowClick(record);
      }
    },
  });

  // Custom class for AntD components in dark mode
  const getAntDarkModeClass = () => {
    if (!darkMode) return "";

    return `
      .ant-table-dark {
        background-color: rgb(55 65 81);
        color: #f9fafb;
      }
      .ant-table-dark .ant-table-thead > tr > th {
        background-color: #2d3748;
        color: #f9fafb;
        border-color: rgba(255, 255, 255, 0.1);
      }
      .ant-table-dark .ant-table-tbody > tr > td {
        color: #f9fafb;
        border-color: rgba(255, 255, 255, 0.1);
      }
      .ant-table-dark .ant-table-tbody > tr:hover > td {
        background-color: #1f2937; /* Đậm hơn so với #374151 */
      }

      .ant-pagination-dark .ant-pagination-item-active {
        border-color: #3b82f6;
        background-color: #3b82f6;
      }
      .ant-pagination-dark .ant-pagination-item-active a {
        color: #ffffff;
      }
      .ant-select-dropdown-dark {
        background-color: #2d3748;
        color: #f9fafb;
      }
      .ant-btn-dark {
        background-color: #3b82f6;
        border-color: #3b82f6;
      }
    `;
  };

  return (
    <div className="w-full p-2 dark:bg-gray-700 dark:text-text-dark text-text-light">
      {/* Include the CSS for AntD dark mode */}
      {darkMode && <style>{getAntDarkModeClass()}</style>}

      {checkbox && <Divider className="dark:border-gray-700" />}
      {checkbox && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <label className="mb-2 sm:mb-0 text-sm dark:text-text-dark text-text-light">
            Select Option:
          </label>
          <Select
            placeholder="Select an option"
            className="w-full sm:w-[200px]"
            value={dynamicSelect}
            onChange={handleSelectChange}
            dropdownClassName={darkMode ? "ant-select-dropdown-dark" : ""}
            style={
              darkMode ? { backgroundColor: "#2d3748", color: "#f9fafb" } : {}
            }
          >
            {selectOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={handleProcessData}
            disabled={isSubmitDisabled}
            className={`mt-2 sm:mt-0 ${darkMode ? "ant-btn-dark" : ""}`}
          >
            Submit
          </Button>
        </div>
      )}
      <div className="w-full">
        <div className="max-w-full">
          <AntTable
            pagination={{
              pageSize: 10,
              className: darkMode ? "ant-pagination-dark" : "",
            }}
            scroll={{
              x: "max-content",
              y: scrollY,
            }}
            className={`text-xs sm:text-sm md:text-base ${
              darkMode ? "ant-table-dark" : ""
            } ${styles.customTable}`}
            rowKey="_id"
            rowSelection={checkbox ? rowSelection : null}
            columns={numberedColumns}
            dataSource={numberedData}
            onRow={onRow}
            loading={loading}
            // We'll let the CSS classes handle the styling
            components={
              darkMode
                ? {
                    header: {
                      cell: (props) => (
                        <th
                          {...props}
                          className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                        />
                      ),
                    },
                    body: {
                      row: (props) => (
                        <tr
                          {...props}
                          className="dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                        />
                      ),
                      cell: (props) => (
                        <td
                          {...props}
                          className="dark:text-gray-100 dark:border-gray-700"
                        />
                      ),
                    },
                  }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
};

TableCustom.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  checkbox: PropTypes.bool,
  onProcessData: PropTypes.func,
  selectOptions: PropTypes.array,
  enableCount: PropTypes.bool,
  loading: PropTypes.bool,
  onRowClick: PropTypes.func,
  scrollY: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default TableCustom;
