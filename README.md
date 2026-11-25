# Dynamic-Form-Builder-Scalable-Form-Submission-System

ADMIN-GMAIL : subbu@gmail.com
ADMIN-PASSWORD : Subbaiya@123

Dynamic Form Builder & Form Submission System

Full-stack dynamic form builder and submission management application built with React, Redux Toolkit, Node.js, Express, and MongoDB.

Features

Form Builder (Admin): Create forms with metadata (name, mail, gender, mobile, description, department, designation, role), add/edit/delete/reorder fields, configure field validation and options, and save as Draft or Published.

Field Types: TEXT, EMAIL, NUMBER, PHONE, TEXTAREA, DATE, SELECT, RADIO, CHECKBOX.

Dynamic Rendering (/forms/:formId): Renders form fields directly from the backend schema without hardcoded form layouts.

Submissions: Validates responses on the server against the form definition and supports paginated submission listing, single submission view, and deletion.

Project Structure

├── client/          # React + Redux Toolkit frontend
├── server/          # Node.js + Express + MongoDB backend
├── postman/         # Postman collection for API testing
├── .env.example     # Environment variable template
└── README.md


Setup

1. Clone & Install

git clone https://github.com/subbaiyanarayanan306-cmd/Dynamic-Form-Builder-Scalable-Form-Submission-System.git
cd Dynamic-Form-Builder-Scalable-Form-Submission-System

# Backend
cd server && npm install

# Frontend
cd ../client && npm install


2. Environment Variables

Copy .env.example to .env inside server/ and update the values:

PORT=5000
MONGO_URI=mongodb://localhost:27017/form_builder
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000


3. Run Locally

# Terminal 1 - Backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 - Frontend (http://localhost:3000)
cd client
npm start


API Endpoints

Forms

POST /api/forms — Create a form

GET /api/forms — List all forms

GET /api/forms/:id — Get form definition

PUT /api/forms/:id — Update form or publish status

DELETE /api/forms/:id — Delete a form

Submissions

POST /api/forms/:formId/submissions — Submit a form response

GET /api/forms/:formId/submissions?page=1&limit=10 — List paginated submissions

GET /api/forms/:formId/submissions/:submissionId — Get single submission

DELETE /api/forms/:formId/submissions/:submissionId — Delete submission

A Postman collection with sample requests is available in /postman.

State Management (Redux Toolkit)

State is divided into domain slices using createSlice and createAsyncThunk with explicit loading, succeeded, and failed states:

Redux Store:

formBuilderSlice: Current form metadata, ordered field definitions, and draft/publish state.

formsSlice: Form list and active schema loaded on /forms/:formId.

submissionsSlice: Paginated submission records, pagination metadata, and selected submission details.

Local Component State (useState):

UI-only state such as modal visibility, field editor drawer toggles, and transient form input values before submit.

Database Design

forms Collection

Stores form metadata and an embedded fields array so a form definition can be loaded in a single read:

{
  "_id": "ObjectId",
  "name": "Customer Registration",
  "mail": "admin@company.com",
  "gender": "Female",
  "mobile": "9876543210",
  "description": "Onboarding form",
  "department": "Engineering",
  "designation": "Lead",
  "role": "Admin",
  "status": "PUBLISHED",
  "fields": [
    {
      "key": "firstName",
      "label": "First Name",
      "type": "TEXT",
      "placeholder": "Enter first name",
      "defaultValue": "",
      "required": true,
      "order": 0
    }
  ],
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}


submissions Collection

Stored in a separate collection referencing formId so high-volume forms do not hit MongoDB's 16 MB document size limit:

{
  "_id": "ObjectId",
  "formId": "ObjectId",
  "responses": {
    "firstName": "Asha",
    "email": "asha@example.com"
  },
  "submittedAt": "ISODate"
}


Validation & Security

Server-Side Validation: Every submission is validated against its stored form schema (required checks, email/phone/number formats, min/max bounds, and strict option matching for SELECT, RADIO, and CHECKBOX). Unknown fields are stripped.

Sanitization & Protection: Strips MongoDB query operators ($, .) from request payloads, applies rate limiting on submission routes, and protects admin routes with JWT authentication.

Scalability Notes

50,000+ Forms: Cache published form schemas in Redis (GET /api/forms/:id) and invalidate on PUT/DELETE. Index { status: 1, updatedAt: -1 } for admin listing.

10M+ Submissions: Keep submissions in a dedicated collection sharded on { formId: 1, _id: 1 } to distribute write load and storage across nodes.

High Concurrent Traffic: Run stateless Express instances behind a load balancer with MongoDB connection pooling and Redis-backed schema reads.

Pagination & Indexing: Use a compound index { formId: 1, _id: -1 } and cursor-based pagination (_id < lastSeenId) instead of large skip() offsets. Project summary fields in list endpoints and load full payloads only on single-submission views.

Background Jobs: Offload emails, webhooks, and CSV exports to a queue (BullMQ / Redis) so POST /api/forms/:formId/submissions returns immediately after persisting data.
