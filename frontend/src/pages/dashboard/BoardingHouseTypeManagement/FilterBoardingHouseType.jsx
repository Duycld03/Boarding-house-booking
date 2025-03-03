import React, { useState } from "react";
import { Button, Form, Input, DatePicker, message } from "antd";
import ButtonCustom from "../../../component/Button";

const { RangePicker } = DatePicker;

function FilterBoardingHouse({ setFilterValue }) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        name: "",
        startDate: "",
        endDate: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (dates, dateStrings) => {
        setFilters((prev) => ({
            ...prev,
            startDate: dateStrings[0] || "",
            endDate: dateStrings[1] || "",
        }));
    };

    const handleSubmit = () => {
        setFilterValue(filters);
        setIsOpen(false);
    };

    const handleClear = () => {
        const clearedFilters = {
            name: "",
            startDate: "",
            endDate: "",
        };
        setFilters(clearedFilters);
        setFilterValue(clearedFilters);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left">
            <ButtonCustom
                onClick={() => setIsOpen((prev) => !prev)}
                size="large"
                title="Filter"
                btnFilter
            />

            {isOpen && (
                <div className="absolute right-0 z-10 mt-2 w-90 origin-top-right rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden rounded-2xl">
                    <Form
                        layout="vertical"
                        className="p-4"
                        onFinish={handleSubmit}
                    >
                        <Form.Item label="Name">
                            <Input
                                placeholder="Enter name"
                                name="name"
                                value={filters.name}
                                onChange={handleInputChange}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Date Range"
                            rules={[
                                {
                                    validator: () => {
                                        if (!filters.startDate || !filters.endDate) {
                                            return Promise.reject(
                                                new Error("Please select a valid date range.")
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <RangePicker
                                style={{ width: "100%" }}
                                onChange={handleDateChange}
                            />
                        </Form.Item>
                        <Form.Item>
                            <div className="flex justify-evenly mt-4">
                                <ButtonCustom
                                    btnFilter
                                    size="large"
                                    htmlType="submit"
                                    className="w-40"
                                />
                                <ButtonCustom
                                    onClick={handleClear}
                                    btnDelete
                                    size="large"
                                    className="w-40"
                                />
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </div>
    );
}

export default FilterBoardingHouse;