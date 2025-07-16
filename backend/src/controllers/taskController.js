import Task from "../models/task.js";
import { Account } from "../models/account.js";

class TaskController {
    async getTasks(req, res) {
        try {
            const { priority, status } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            let filter = {};

            if (req.user.role === 'staff') {
                filter.responsibleBy = req.user.userId;
            } else {
                if (req.query.responsibleBy) {
                    filter.responsibleBy = req.query.responsibleBy;
                }
            }

            if (priority) filter.priority = priority;
            if (status) filter.status = status;

            const totalTasks = await Task.countDocuments(filter);

            if (totalTasks === 0) {
                return res.status(200).json({
                    message: "No tasks found",
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalItems: 0,
                        hasNextPage: false,
                        hasPrevPage: false,
                    },
                    data: [],
                });
            }

            const tasks = await Task.find(filter)
                .populate("responsibleBy", "fullname email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalPages = Math.ceil(totalTasks / limit);

            return res.status(200).json({
                success: true,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalTasks,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
                data: tasks,
            });
        } catch (error) {
            console.error("Error in getTasks:", error);
            return res.status(500).json({ success: false, message: error.message });
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