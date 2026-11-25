# Dynamic-Form-Builder-Scalable-Form-Submission-System

Dynamic Form Builder & Scalable Form Submission SystemA full-stack Dynamic Form Builder and Form Submission System built with React.js, Redux Toolkit, Node.js, Express.js, and MongoDB. Administrators can create, customize, reorder, draft, and publish dynamic forms, while end users can access published forms via dynamic routes (/forms/:formId) and submit validated responses at scale.Table of ContentsFeaturesTech StackProject StructureSetup & InstallationAPI EndpointsArchitecture & State ManagementDatabase DesignValidation & SecurityScalability & System DesignFeaturesAdmin Form Builder:Configure form metadata (name, mail, gender, mobile, description, department, designation, role).Add, edit, delete, and reorder dynamic fields.Configure label, key, placeholder, defaultValue, required status, validation rules, and allowed options (for SELECT, RADIO, and CHECKBOX fields).Save forms as Draft or Publish them for public/user access.Supported Field Types:TEXT, EMAIL, NUMBER, PHONE, TEXTAREA, DATE, SELECT, RADIO, CHECKBOX.Dynamic Form Rendering (/forms/:formId):Fetches the form schema dynamically from the backend and renders fields without hard-coded form components. Adding new fields in the database requires zero code changes in the frontend.Form Submission & Management:Server-side schema-driven validation on POST /api/forms/:formId/submissions.Admin submission dashboard with pagination, single-submission detail view, and submission deletion.Tech StackFrontend: React.js, Redux Toolkit, React Router, Axios / FetchBackend: Node.js, Express.jsDatabase: MongoDB (Mongoose ODM)API Testing: Postman Collection (included in /postman)Project StructureDynamic-Form-Builder-Scalable-Form-Submission-System/
├── client/                  # React.js + Redux Toolkit frontend
│   ├── src/
│   │   ├── app/             # Redux store configuration
│   │   ├── features/        # Redux slices (formBuilder, forms, submissions)
│   │   ├── components/      # Reusable dynamic field renderers & UI components
│   │   └── pages/           # Admin Builder, Public Form (/forms/:formId), Submissions
│   └── package.json
├── server/                  # Node.js + Express.js backend
│   ├── src/
│   │   ├── config/          # Database & environment configuration
│   │   ├── controllers/     # Route handlers for forms & submissions
│   │   ├── middleware/      # Auth, validation, rate limiting, error handling
│   │   ├── models/          # Mongoose schemas (Form, Submission)
│   │   ├── routes/          # Express route definitions
│   │   └── utils/           # Dynamic schema validator & sanitizers
│   └── package.json
├── postman/                 # Postman collection & environment examples
├── .env.example             # Sample environment variables
└── README.md
Setup & InstallationPrerequisitesNode.js (v18+ recommended)npm or yarnMongoDB (local instance or MongoDB Atlas URI)1. Clone the Repositorygit clone https://github.com/subbaiyanarayanan306-cmd/Dynamic-Form-Builder-Scalable-Form-Submission-System.git
cd Dynamic-Form-Builder-Scalable-Form-Submission-System
2. Configure Environment VariablesCreate a .env file in the server/ directory (and client/ if applicable) using .env.example as a template:cp .env.example server/.env
Example server/.env:PORT=5000
MONGO_URI=mongodb://localhost:27017/dynamic_form_builder
JWT_SECRET=replace_with_a_strong_secret_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
3. Install & Start the Backendcd server
npm install
npm run dev
The API server will run on http://localhost:5000.4. Install & Start the FrontendOpen a second terminal:cd client
npm install
npm start
The React application will run on http://localhost:3000.API EndpointsForm Management (Admin Protected)MethodEndpointPurposePOST/api/formsCreate a new form (Draft or Published)GET/api/formsList all forms (with filtering/pagination)GET/api/forms/:idRetrieve a single form definition by IDPUT/api/forms/:idUpdate form metadata, fields, order, or statusDELETE/api/forms/:idDelete a formForm SubmissionsMethodEndpointPurposePOST/api/forms/:formId/submissionsValidate & submit user responses for a published formGET/api/forms/:formId/submissionsList paginated submissions for a form (Admin)GET/api/forms/:formId/submissions/:submissionIdView a single submission detail (Admin)DELETE/api/forms/:formId/submissions/:submissionIdDelete a submission (Admin)API Examples: Import the Postman collection from the /postman directory to test all endpoints with sample payloads.Architecture & State ManagementRedux Toolkit ArchitectureApplication state is split into focused domain slices with async thunks (createAsyncThunk) and standardized loading, succeeded, and failed status tracking:formBuilderSlice: Manages the active form being created or edited in the builder (form metadata, ordered fields array, draft/publish status, save state).formsSlice: Manages the list of forms on the admin dashboard and the active form schema fetched for /forms/:formId.submissionsSlice: Manages paginated submission lists, pagination metadata (page, limit, totalPages, totalCount), single-submission inspection, and deletion states.Redux State vs. Local Component StateStored in Redux:Cross-route domain data (form definitions, form lists, submission lists, active submission details).Server-synchronized state and async request lifecycle (loading, error, success) needed across multiple components.Kept in Local Component State (useState):Ephemeral UI state such as open/closed modals, active field-editor drawers, dropdown toggles, and transient drag-and-drop hover indices.Controlled input values during active typing in a public form before submission, preventing unnecessary global store updates on every keystroke.Database Design1. Form Collection (forms)Stores form metadata and an embedded, ordered array of dynamic field definitions so an entire form schema is retrieved in a single read operation.{
  "_id": "ObjectId",
  "name": "Customer Registration",
  "mail": "admin@example.com",
  "gender": "Other",
  "mobile": "+1234567890",
  "description": "Onboarding registration form",
  "department": "Operations",
  "designation": "Manager",
  "role": "Admin",
  "status": "PUBLISHED",
  "fields": [
    {
      "key": "firstName",
      "label": "First Name",
      "type": "TEXT",
      "placeholder": "Enter your first name",
      "defaultValue": "",
      "required": true,
      "order": 0,
      "validation": { "minLength": 2, "maxLength": 50 }
    },
    {
      "key": "gender",
      "label": "Gender",
      "type": "SELECT",
      "required": true,
      "order": 1,
      "options": ["Male", "Female", "Other"]
    }
  ],
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
2. Submission Collection (submissions)Stored in a separate collection rather than embedded inside Form documents so individual forms can accumulate millions of submissions without hitting MongoDB's 16 MB BSON document size limit.{
  "_id": "ObjectId",
  "formId": "ObjectId (ref: Form)",
  "responses": {
    "firstName": "Jane",
    "email": "jane@example.com",
    "gender": "Female"
  },
  "submittedAt": "ISODate"
}
Validation & SecurityIndependent Backend Validation: On POST /api/forms/:formId/submissions, the server fetches the stored form definition and validates every field dynamically—checking required fields, email/phone/numeric formats, min/max lengths or numeric bounds, valid dates, and verifying that SELECT, RADIO, and CHECKBOX values strictly match the configured options. Unknown or unexpected keys are stripped or rejected.Sanitization & Injection Protection: Incoming payloads are sanitized to mitigate XSS and NoSQL operator injection (e.g., stripping $ and . keys from user inputs).Authentication & Authorization: Admin endpoints (creating, editing, publishing, deleting forms, and reading/deleting submissions) are protected by authentication and role-based authorization middleware.Rate Limiting & Secrets Management: Rate limiting is applied to submission endpoints to prevent spam/abuse, and all sensitive credentials are loaded via environment variables (.env is excluded via .gitignore, with .env.example provided).Scalability & System Design1. Handling 50,000+ FormsRead Caching: Published form schemas are read-heavy and rarely change once published. Caching GET /api/forms/:id responses in Redis (with cache invalidation whenever PUT /api/forms/:id or DELETE /api/forms/:id is executed) eliminates repetitive database reads under heavy traffic.Admin Listing: Indexes on { status: 1, updatedAt: -1 } and { department: 1 } ensure fast filtering and paginated browsing across 50,000+ forms.2. Handling 10 Million+ SubmissionsSeparate Collection & Sharding: Keeping submissions in its own collection avoids document bloat. At 10M+ records, the submissions collection can be horizontally sharded using a hashed or compound shard key on { formId: 1, _id: 1 } to distribute write throughput and storage evenly across shards.Data Archival / TTL: Older submissions can be archived to cold storage (e.g., S3) or managed with retention policies if required.3. High Concurrent Submission TrafficStateless API Tier: Express servers remain completely stateless, allowing horizontal auto-scaling behind a load balancer (NGINX / AWS ALB).Database Connection Pooling: Tuned MongoDB connection pools handle concurrent bursts efficiently without exhausting sockets.Write-Optimized Ingestion: Validation runs in-memory against the cached form definition followed by a single indexed insert into submissions.4. Large Submission Lists & Efficient PaginationCompound Indexes: A compound index on { formId: 1, submittedAt: -1 } (or { formId: 1, _id: -1 }) allows MongoDB to satisfy both the filter and sort order directly from the index without in-memory sorting.Cursor-Based Pagination: While offset pagination (page & limit) works for early pages, deep pages (skip(500000)) degrade in performance. Using cursor-based pagination (WHERE formId = :formId AND _id < :lastSeenId LIMIT :limit) guarantees constant-time $O(\log N)$ lookups regardless of dataset depth.Field Projection: List views project only summary columns and metadata, fetching the full responses payload only when viewing a single submission.5. Background Jobs & QueuesWhen post-submission workflows are needed—such as confirmation emails, admin notifications, webhook deliveries, or large CSV/Excel exports—they are decoupled from the HTTP request lifecycle using a message queue (BullMQ + Redis or RabbitMQ / AWS SQS).POST /api/forms/:formId/submissions persists the validated submission, enqueues a lightweight job (submission.created), and immediately returns 201 Created, while background workers process retries and heavy tasks asynchronously.
