import Task from "../models/task.js";
import { Account } from "../models/account.js";
import paginate from '../utils/pagination.js';
class TaskController {
    async getTasks(req, res) {
        try {
            const account = await Account.findById(req.user.userId);
            if (!account) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            let filter = {};
            if (account.role === "staff") {
                filter.responsibleBy = account._id;
            } else if (account.role === "owner") {
                if (req.query.responsibleBy === "null") {
                    filter.responsibleBy = { $exists: false };
                } else if (req.query.responsibleBy) {
                    filter.responsibleBy = req.query.responsibleBy;
                }
            }

            const { priority, status, startDate, endDate, search } = req.query;
            if (priority) filter.priority = priority;
            if (status) filter.status = status;
            if (startDate && endDate) {
                filter.createdAt = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                };
            }

            // Cấu hình phân trang
            const paginationOptions = {
                defaultPage: 1,
                defaultLimit: 10,
                maxLimit: 100,
                sortField: "createdAt",
                sortOrder: "desc",
                filter,
                allowQueryFilters: ["priority", "status"],
                allowSearchFields: ["title", "details"],
                fields: "-__v",
                populate: ["responsibleBy"],
                includeTotalData: true,
            };

            const result = await paginate(Task, paginationOptions, req);

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (error) {
            console.error("Error in getTasks:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch tasks. Please try again later.",
                error: error.message,
            });
        }
    }

    async createTask(req, res) {
        try {
            const { title, responsibleBy, details, priority, dueDate, createdBy } = req.body;
            const responsibleUser = await Account.findById(responsibleBy);
            if (!responsibleUser) {
                return res.status(400).json({ message: "Invalid responsible user" });
            }
            const task = new Task({
                title,
                createdBy,
                responsibleBy,
                details,
                priority,
                dueDate,
            });
            await task.save();

            return res.status(201).json({ success: true, message: "Task created successfully", task });
        } catch (error) {
            console.error("Error in createTask:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const { title, responsibleBy, details, priority, status, dueDate } = req.body;
            const userId = req.user.userId;
            const userRole = req.user.role;

            const task = await Task.findById(id);
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }
            if (userRole === 'staff' && task.responsibleBy.toString() !== userId) {
                return res.status(403).json({ message: "You can only update your own tasks" });
            }
            if (userRole === 'staff') {
                if (status) task.status = status;
            } else if (userRole === 'owner') {
                if (title) task.title = title;
                if (responsibleBy) {
                    const user = await Account.findById(responsibleBy);
                    if (!user) return res.status(400).json({ message: "Invalid responsible user" });
                    task.responsibleBy = responsibleBy;
                }
                if (details) task.details = details;
                if (priority) task.priority = priority;
                if (status) task.status = status;
                if (dueDate) task.dueDate = dueDate;
            }

            task.updatedAt = new Date();
            await task.save();

            return res.status(200).json({
                success: true,
                message: "Task updated successfully",
                task,
            });
        } catch (error) {
            console.error("Error in updateTask:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteTask(req, res) {
        try {
            const { id } = req.params;

            const task = await Task.findByIdAndDelete(id);
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }

            return res.status(200).json({ success: true, message: "Task deleted successfully" });
        } catch (error) {
            console.error("Error in deleteTask:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default new TaskController();