import { useState, useEffect, useMemo, useCallback } from "react";
import { Divider, Table as AntTable, Button, Select, Grid, theme } from "antd";
import PropTypes from "prop-types";
import { useTheme } from "../../context/themeContext";
import { createStyles } from "antd-style";
import classNames from "classnames";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const getTableStyles = (isDarkMode) => `
  /* Base table styles */
  .custom-table .ant-table .ant-table-container .ant-table-body,
  .custom-table .ant-table .ant-table-container .ant-table-content {
    scrollbar-width: none;
    scrollbar-color: #eaeaea transparent;
    scrollbar-gutter: stable;
  }

  /* Dark mode styles */
  ${
    isDarkMode
      ? `
    /* Table styles */
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
      background-color: #1f2937;
    }

    /* Pagination styles */
    .ant-pagination-dark .ant-pagination-prev .ant-pagination-item-link,
    .ant-pagination-dark .ant-pagination-next .ant-pagination-item-link {
      background-color: #2d3748 !important;
      color: #f9fafb !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
    }
    
    .ant-pagination-dark .ant-pagination-prev:hover .ant-pagination-item-link,
    .ant-pagination-dark .ant-pagination-next:hover .ant-pagination-item-link {
      background-color: #1f2937 !important;
      border-color: #3b82f6 !important;
      color: #ffffff !important;
    }
    
    .ant-pagination-dark .ant-pagination-disabled .ant-pagination-item-link,
    .ant-pagination-dark .ant-pagination-disabled:hover .ant-pagination-item-link {
      background-color: rgba(45, 55, 72, 0.5) !important;
      color: rgba(249, 250, 251, 0.5) !important;
      border-color: rgba(255, 255, 255, 0.05) !important;
      cursor: not-allowed;
    }
    
    .ant-pagination-dark .ant-pagination-item {
      background-color: #2d3748 !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
    }
    
    .ant-pagination-dark .ant-pagination-item a {
      color: #f9fafb !important;
    }
    
    .ant-pagination-dark .ant-pagination-item-active {
      background-color: #3b82f6 !important;
      border-color: #3b82f6 !important;
    }
    
    .ant-pagination-dark .ant-pagination-item-active a {
      color: #ffffff !important;
    }
    
    .ant-pagination-dark .ant-pagination-options .ant-select-selector {
      background-color: #2d3748 !important;
      color: #f9fafb !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
    }
    
    .ant-pagination-dark .ant-pagination-options .ant-select-arrow {
      color: #f9fafb !important;
    }
    
    .ant-pagination-dark .ant-pagination-options-quick-jumper {
      color: #f9fafb !important;
    }
    
    .ant-pagination-dark .ant-pagination-options-quick-jumper input {
      background-color: #2d3748 !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
      color: #f9fafb !important;
    }
    
    .ant-select-dropdown-dark {
      background-color: #2d3748;
      color: #f9fafb;
    }
    
    .ant-btn-dark {
      background-color: #3b82f6;
      border-color: #3b82f6;
    }
  `
      : ""
  }
`;

/**
 * Enhanced TableCustom component with improved performance and maintainability
 *
 * @param {Object} props Component props
 * @returns {JSX.Element} TableCustom component
 */
const TableCustom = ({
  columns,
  data = [],
  checkbox = false,
  onProcessData,
  selectOptions = [],
  enableCount = true,
  loading = false,
  onRowClick,
  scrollY = null,
  pagination = {},
  onChange = () => {},
  tableName,
  noDataText = "No data available",
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dynamicSelect, setDynamicSelect] = useState(null);
  const { darkMode } = useTheme();
  const { t } = useTranslation("menu");

  // Memoize pagination config to avoid unnecessary re-renders
  const paginationConfig = useMemo(
    () => ({
      showSizeChanger: true,
      pageSize: 10,
      showTotal: (total, range) => (
        <span
          style={{
            color: darkMode ? "#ddd" : "#333",
            userSelect: "none",
            fontWeight: "500",
          }}
        >
          {`${range[0]}-${range[1]} ${t(
            "table-component.pagination.of"
          )} ${total} ${tableName}`}
        </span>
      ),
      ...pagination,
      classNames: classNames(
        "ant-pagination",
        darkMode ? "ant-pagination-dark" : ""
      ),
    }),
    [pagination, darkMode, t, tableName]
  );

  // Determine if submit button should be disabled
  const isSubmitDisabled = useMemo(() => {
    return !(selectedRows.length > 0 && dynamicSelect !== null);
  }, [selectedRows.length, dynamicSelect]);

  // Cập nhật hàm numberedData để sử dụng trực tiếp từ props pagination
  const numberedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Lấy giá trị trực tiếp từ props pagination
    const pageSize = pagination.pageSize || 10;
    const currentPage = pagination.current || 1;

    // Tính số thứ tự bắt đầu cho trang hiện tại
    const startNumber = (currentPage - 1) * pageSize + 1;

    // Thêm số thứ tự cho mỗi item
    return data.map((item, index) => ({
      ...item,
      number: startNumber + index,
    }));
  }, [data, pagination.current, pagination.pageSize]);

  // Memoize the columns with numbering column if enableCount is true
  const numberedColumns = useMemo(() => {
    if (!enableCount) return columns;

    return [
      {
        title: "No.",
        dataIndex: "number",
        key: "number",
        width: 60,
        render: (_, record) => <span>{record.number}</span>,
      },
      ...columns,
    ];
  }, [columns, enableCount]);

  // Callback for row selection changes
  const onSelectChange = useCallback((newSelectedRowKeys, newSelectedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  }, []);

  // Callback for dynamic select changes
  const handleSelectChange = useCallback((value) => {
    setDynamicSelect(value);
  }, []);

  // Callback for processing data
  const handleProcessData = useCallback(() => {
    if (onProcessData && typeof onProcessData === "function") {
      onProcessData({
        formValues: { dynamicSelect },
        selectedRows: selectedRows,
      });
    }

    // Reset form after processing
    setDynamicSelect(null);
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }, [dynamicSelect, selectedRows, onProcessData]);

  // Memoize row selection configuration
  const rowSelection = useMemo(
    () => ({
      selectedRowKeys,
      onChange: onSelectChange,
      getCheckboxProps: (record) => ({
        name: record.name,
        disabled: false,
      }),
    }),
    [selectedRowKeys, onSelectChange]
  );

  // Callback for row click handling
  const handleRowClick = useCallback(
    (record) => {
      if (onRowClick && typeof onRowClick === "function") {
        onRowClick(record);
      }
    },
    [onRowClick]
  );

  return (
    <div>
      <style>{getTableStyles(darkMode)}</style>

      {checkbox && (
        <>
          <Divider className={darkMode ? "border-gray-700" : ""} />
          <div className={styles.formContainer}>
            <label className={styles.formLabel}>Select Option:</label>
            <Select
              placeholder="Select an option"
              className={styles.formSelect}
              value={dynamicSelect}
              onChange={handleSelectChange}
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
              className={`${styles.formButton} ${
                darkMode ? "table-action-button" : ""
              }`}
            >
              Submit
            </Button>
          </div>
        </>
      )}

      <div className="w-full">
        <div className="max-w-full ">
          <AntTable
            pagination={{
              className: paginationConfig.classNames,
              ...paginationConfig,
            }}
            scroll={{
              x: "max-content",
              y: scrollY,
            }}
            className={`text-xs sm:text-sm md:text-base ${
              darkMode ? "ant-table-dark" : ""
            } custom-table`}
            rowKey="_id"
            rowSelection={checkbox ? rowSelection : null}
            columns={numberedColumns}
            dataSource={numberedData}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            loading={loading}
            onChange={onChange}
            // locale={{
            //   emptyText: noDataText,
            // }}
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
  pagination: PropTypes.object,
  onChange: PropTypes.func,
  noDataText: PropTypes.string,
  tableName: PropTypes.string,
};

export default TableCustom;
