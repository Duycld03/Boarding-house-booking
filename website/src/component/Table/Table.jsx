const { Option } = Select;
import { useState, useEffect } from "react";
import { Divider, Table as AntTable, Button, Select, Grid, theme } from "antd";
import { createStyles } from "antd-style";
import PropTypes from "prop-types";

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
        .ant-pagination-prev .ant-btn,
        .ant-pagination-next .ant-btn {
          background-color: ${token.colorBgContainer} !important;
          color: ${token.colorTextSecondary} !important;
          border-color: ${token.colorBorder} !important;
        }
        
        .ant-pagination-prev:hover .ant-btn,
        .ant-pagination-next:hover .ant-btn {
          background-color: ${token.colorBgTextHover} !important;
          border-color: ${token.colorPrimary} !important;
          color: ${token.colorPrimary} !important;
        }
        
        .ant-pagination-item {
          background-color: ${token.colorBgContainer} !important;
          border-color: ${token.colorBorder} !important;
        }
        
        .ant-pagination-item a {
          color: ${token.colorTextSecondary} !important;
        }
        
        .ant-pagination-item-active {
          background-color: ${token.colorPrimary} !important;
          border-color: ${token.colorPrimary} !important;
        }
        
        .ant-pagination-item-active a {
          color: #ffffff !important;
        }
        
        .ant-pagination-options .ant-select-selector {
          background-color: ${token.colorBgContainer} !important;
          color: ${token.colorTextSecondary} !important;
          border-color: ${token.colorBorder} !important;
        }
        
        .ant-pagination-options .ant-select-arrow {
          color: ${token.colorTextSecondary} !important;
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
  isDarkMode = false, // Add dark mode prop
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dynamicSelect, setDynamicSelect] = useState(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  // Custom styles using antd-style
  const { styles } = useStyle({ isDarkMode });

  const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  };

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

  return (
    <div className="w-full p-2">
      {checkbox && <Divider />}
      {checkbox && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <label className="mb-2 sm:mb-0 text-sm">Select Option:</label>
          <Select
            placeholder="Select an option"
            className="w-full sm:w-[200px]"
            value={dynamicSelect}
            onChange={handleSelectChange}
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
            className="mt-2 sm:mt-0"
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
            }}
            scroll={{
              x: "max-content",
            }}
            className={`text-xs sm:text-sm md:text-base ${styles.customTable}`}
            rowKey="_id"
            rowSelection={checkbox ? rowSelection : null}
            columns={numberedColumns}
            dataSource={numberedData}
            onRow={onRow}
            loading={loading}
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
  isDarkMode: PropTypes.bool,
};

export default TableCustom;
