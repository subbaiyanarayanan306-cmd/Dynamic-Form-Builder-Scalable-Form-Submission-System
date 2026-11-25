
const express = require("express");
const router = express.Router();

// Controllers
const {
  adminLogin,
  createForm,
  getAllForms,
  getSingleForm,
  updateForm,
  deleteForm,
  updateFormStatus,
  submitForm,
  getAllSubmissions,
  getPublishedForms,
} = require("../controllers/formController");

// Middleware
const authMiddleware = require("../middleware/authMiddleware");

// ========================================
// PUBLIC ROUTES
// ========================================

// Admin Login
router.post("/login", adminLogin);

// Get Published Forms (Public)
router.get("/published", getPublishedForms);

// Submit Form (Public)
router.post("/:id/submit", submitForm);

// ========================================
// ADMIN PROTECTED ROUTES
// ========================================

router.use(authMiddleware);

// Create Form
router.post("/", createForm);

// Get All Submissions
router.get("/submissions", getAllSubmissions);

// Get All Forms
router.get("/", getAllForms);

// Get Single Form
router.get("/:id", getSingleForm);

// Update Form
router.put("/:id", updateForm);

// Delete Form
router.delete("/:id", deleteForm);

// Publish / Draft
router.patch("/:id/status", updateFormStatus);

module.exports = router;
