const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignment.controller");

router.post("/", assignmentController.assignOrderToVehicle);
router.get("/", assignmentController.getAssignments);
router.delete("/:id", assignmentController.unassignOrder);
module.exports = router;
