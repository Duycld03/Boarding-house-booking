import React, { useState } from "react";
import { Button, Form, Input, DatePicker, message } from "antd";
import ButtonCustom from "../../../component/Button";
import moment from "moment";

function FilterBoardingHouse({ setFilterValue }) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        name: "",
        startDate: null,
        endDate: null,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleStartDateChange = (date) => {
        setFilters((prev) => ({
            ...prev,
            startDate: date ? date.format("YYYY-MM-DD") : null,
        }));
    };

    const handleEndDateChange = (date) => {
        setFilters((prev) => ({
            ...prev,
            endDate: date ? date.format("YYYY-MM-DD") : null,
        }));
    };

    const handleSubmit = () => {
        const { startDate, endDate } = filters;

        // Validate date range
        if (startDate && !endDate) {
            message.error("Please select an end date.");
            return;
        }

        if (endDate && !startDate) {
            message.error("Please select a start date.");
            return;
        }

        if (startDate && endDate && moment(startDate).isAfter(moment(endDate))) {
            message.error("Start date cannot be later than end date.");
            return;
        }

        setFilterValue(filters);
        setIsOpen(true);
    };

    const handleClear = () => {
        const clearedFilters = {
            name: "",
            startDate: null,
            endDate: null,
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

                        <Form.Item label="Start Date" name="startDate" className="mb-2">
                            <DatePicker
                                className="w-full"
                                value={filters.startDate ? moment(filters.startDate, "YYYY-MM-DD") : null}
                                onChange={handleStartDateChange}
                                format="DD-MM-YYYY"
                                allowClear
                            />
                        </Form.Item>

                        <Form.Item label="End Date" name="endDate" className="mb-2">
                            <DatePicker
                                className="w-full"
                                value={filters.endDate ? moment(filters.endDate, "YYYY-MM-DD") : null}
                                onChange={handleEndDateChange}
                                format="DD-MM-YYYY"
                                allowClear
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