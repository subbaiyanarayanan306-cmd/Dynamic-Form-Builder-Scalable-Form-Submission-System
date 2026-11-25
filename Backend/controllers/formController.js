
const Form = require("../models/Form");
const Admin = require("../models/Admin");
const validateForm = require("../validators/formValidator");
const Submission = require("../models/Submission");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ========================================
// ADMIN LOGIN
// ========================================

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await Admin.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error("Admin Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================================
// CREATE FORM
// ========================================

const createForm = async (req, res) => {
  try {
    const formData = req.body;

    const errors = validateForm(formData);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Form validation failed",
        errors,
      });
    }

    const newForm = await Form.create({
      name: formData.name,
      description: formData.description || "",
      fields: formData.fields,
      status: formData.status || "draft",
    });

    return res.status(201).json({
      success: true,
      message: "Form created successfully",
      data: newForm,
    });

  } catch (error) {
    console.error("Create Form Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================================
// GET ALL FORMS
// ========================================

const getAllForms = async (req, res) => {
  try {
    const forms = await Form.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: forms.length,
      message: "Forms fetched successfully",
      data: forms,
    });

  } catch (error) {
    console.error("Get All Forms Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================================
// GET SINGLE FORM
// ========================================

const getSingleForm = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID",
      });
    }

    const form = await Form.findById(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Form fetched successfully",
      data: form,
    });

  } catch (error) {
    console.error("Get Single Form Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================================
// UPDATE FORM
// ========================================

const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const formData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID",
      });
    }

    const existingForm = await Form.findById(id);

    if (!existingForm) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    const errors = validateForm(formData);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Form validation failed",
        errors,
      });
    }

    const updatedForm = await Form.findByIdAndUpdate(
      id,
      {
        name: formData.name,
        description: formData.description ?? "",
        fields: formData.fields,
        status: formData.status || "draft",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Form updated successfully",
      data: updatedForm,
    });

  } catch (error) {
    console.error("Update Form Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================================
// DELETE FORM
// ========================================

const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID",
      });
    }

    const deletedForm = await Form.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Form deleted successfully",
      data: deletedForm,
    });

  } catch (error) {
    console.error("Delete Form Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================================
// DRAFT AND PUBLISH FORM
// ========================================

const updateFormStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID",
      });
    }

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be draft or published",
      });
    }

    const existingForm = await Form.findById(id);

    if (!existingForm) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    // Validate form before publishing
    if (status === "published") {
      const errors = validateForm(existingForm.toObject());

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot publish invalid form",
          errors,
        });
      }

      if (existingForm.fields.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Add at least one field before publishing",
        });
      }
    }

    existingForm.status = status;

    await existingForm.save();

    return res.status(200).json({
      success: true,
      message:
        status === "published"
          ? "Form published successfully"
          : "Form moved to draft successfully",
      data: existingForm,
    });

  } catch (error) {
    console.error("Update Form Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const submitForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    // Validate form ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID",
      });
    }

    // Check answers
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      });
    }

    // Find published form
    const form = await Form.findOne({
      _id: id,
      status: "published",
    });

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Published form not found",
      });
    }

    // Validate submitted answers
    const errors = [];
    const validAnswers = [];

    for (const field of form.fields) {
      const answer = answers.find(
        (item) => item.fieldId === field._id.toString()
      );

      const value = answer ? answer.value : null;

      // Required validation
      const isEmpty =
        value === null ||
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (field.required && isEmpty) {
        errors.push(`${field.label} is required`);
        continue;
      }

      if (isEmpty) {
        continue;
      }

      // Field type validation
      if (
        ["text", "textarea", "email", "phone", "date"].includes(field.type) &&
        typeof value !== "string"
      ) {
        errors.push(`${field.label} must be a string`);
        continue;
      }

      if (field.type === "number" && typeof value !== "number") {
        errors.push(`${field.label} must be a number`);
        continue;
      }

      if (
        field.type === "email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        errors.push(`${field.label} must be a valid email`);
        continue;
      }

      if (
        field.type === "select" &&
        !field.options.includes(value)
      ) {
        errors.push(`Invalid option for ${field.label}`);
        continue;
      }

      if (
        field.type === "radio" &&
        !field.options.includes(value)
      ) {
        errors.push(`Invalid option for ${field.label}`);
        continue;
      }

      if (
        field.type === "checkbox" &&
        (
          !Array.isArray(value) ||
          !value.every((item) => field.options.includes(item))
        )
      ) {
        errors.push(`Invalid checkbox values for ${field.label}`);
        continue;
      }

      // Length validation
      if (
        typeof value === "string" &&
        field.minLength !== undefined &&
        value.length < field.minLength
      ) {
        errors.push(`${field.label} is too short`);
        continue;
      }

      if (
        typeof value === "string" &&
        field.maxLength !== undefined &&
        value.length > field.maxLength
      ) {
        errors.push(`${field.label} is too long`);
        continue;
      }

      // Number range validation
      if (field.type === "number") {
        if (field.min !== undefined && value < field.min) {
          errors.push(`${field.label} is below minimum value`);
          continue;
        }

        if (field.max !== undefined && value > field.max) {
          errors.push(`${field.label} exceeds maximum value`);
          continue;
        }
      }

      validAnswers.push({
        fieldId: field._id,
        key: field.key,
        value,
      });
    }

    // Reject unknown or duplicate field IDs
    const submittedIds = answers.map((item) => item.fieldId);

    if (new Set(submittedIds).size !== submittedIds.length) {
      errors.push("Duplicate field answers are not allowed");
    }

    const validFieldIds = new Set(
      form.fields.map((field) => field._id.toString())
    );

    for (const answer of answers) {
      if (
        !answer ||
        typeof answer.fieldId !== "string" ||
        !validFieldIds.has(answer.fieldId)
      ) {
        errors.push("Invalid field submitted");
        break;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Submission validation failed",
        errors,
      });
    }

    // Save submission
    const submission = await Submission.create({
      formId: form._id,
      answers: validAnswers,
    });

    return res.status(201).json({
      success: true,
      message: "Form submitted successfully",
      data: submission,
    });

  } catch (error) {
    console.error("Submit Form Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("formId", "name description")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: submissions.length,
      message: "Submissions fetched successfully",
      data: submissions,
    });

  } catch (error) {
    console.error("Get All Submissions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getPublishedForms = async (req, res) => {
  try {
    const forms = await Form.find({
      status: "published",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: forms.length,
      message: "Published forms fetched successfully",
      data: forms,
    });

  } catch (error) {
    console.error("Get Published Forms Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// ========================================
// EXPORT CONTROLLERS
// ========================================

module.exports = {
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
};
