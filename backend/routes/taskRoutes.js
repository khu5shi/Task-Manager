const express = require('express');
const {protect,adminOnly}= require("../middlewares/authMiddleware");
const { updateMany } = require('../models/User');
const { getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskCheckList, getDashboardData, getUserDashboardData } = require("../controllers/taskController");

const router = express.Router();

//task Mnanagment routes
router.get("/dashboard-data", protect,getDashboardData);
router.get("/user-dashboard-data", protect,getUserDashboardData);
router.get("/",protect,getTasks);
router.get("/:id", protect, getTaskById);
router.post("/", protect,adminOnly, createTask);
router.put("/:id", protect,updateTask);
router.delete("/:id", protect,adminOnly, deleteTask);
router.put("/:id/status", protect, updateTaskStatus);
router.put("/:id/todo", protect, updateTaskCheckList);

module.exports = router;