import { useState, useEffect } from 'react';
import { Divider, Table as AntTable, Button, Select } from 'antd';
import PropTypes from 'prop-types';

const { Option } = Select;

const TableCustom = ({
  columns,
  data,
  checkbox = false,
  onProcessData,
  selectOptions = [],
  enableCount = true,
  loading = false,
  onRowClick,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dynamicSelect, setDynamicSelect] = useState(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

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
    if (onProcessData && typeof onProcessData === 'function') {
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
          title: 'No.',
          dataIndex: 'number',
          key: 'number',
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
      if (onRowClick && typeof onRowClick === 'function') {
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
      <div className="w-full overflow-x-auto">
        <AntTable
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          className="text-xs sm:text-sm md:text-base"
          rowKey="_id"
          rowSelection={checkbox ? rowSelection : null}
          columns={numberedColumns}
          dataSource={numberedData}
          onRow={onRow}
        />
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
};

export default TableCustom;
