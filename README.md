# ApexCRUD Cloud Manager — Supabase PostgreSQL & React

Modern full-stack CRUD web application with **Supabase PostgreSQL** database, **Supabase Authentication**, role-based student & admin permissions, and Netlify deployment readiness.

---

## 1. Supabase Backend Setup

### Step A: Run the SQL Script
1. Log in to your [Supabase Dashboard](https://app.supabase.com).
2. Go to **SQL Editor** > **New query**.
3. Open `supabase_schema.sql` from this project, paste the content into the editor, and click **Run**.
4. This creates:
   - `public.profiles` table with `role` column (`admin` vs `student`)
   - `public.records` table with UUID primary keys, indexes, and timestamps
   - Trigger `on_auth_user_created` to sync user profiles automatically on registration
   - **Row Level Security (RLS)**:
     - **Students**: Can search and view records.
     - **Admins**: Full CRUD (Add, Edit, Delete, View).

### Step B: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```
*(You can find these in Supabase Dashboard > Project Settings > API).*

You can also set these credentials inside the running web app by clicking the **"SQL Schema"** button in the header.

---

## 2. Role-Based Access Control (RBAC)

- **ADMIN Role**:
  - Full CRUD permissions: Can create records via the Add form, edit existing records, delete individual or batch records, search, filter, and export data.
- **STUDENT Role**:
  - View & Search permissions: Can log in, search across all columns, view detailed record drawer modals, filter by category/status/priority, and export to CSV/JSON.
  - Form additions, edits, and deletions are securely blocked at both the UI and PostgreSQL Row Level Security (RLS) layers.

---

## 3. How to Run in Visual Studio Code (VS Code)

### Step 1: Open the Project in VS Code
1. Launch **Visual Studio Code**.
2. Click **File** > **Open Folder...** and select this directory.

### Step 2: Open the Terminal
In VS Code, open the terminal by pressing `` Ctrl + ` `` or **Terminal** > **New Terminal**.

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start the Dev Server
```bash
npm run dev
```

### Step 5: Open in Your Browser
Visit **[http://localhost:3000](http://localhost:3000)**.

---

## 4. How to Deploy to Netlify

This project includes `netlify.toml` and `public/_redirects` for zero-config Netlify hosting:

1. Push this repository to GitHub or GitLab.
2. In [app.netlify.com](https://app.netlify.com), click **"Add new site"** > **"Import an existing project"**.
3. Under Environment variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Netlify will build with `npm run build` and publish the `dist` directory.

---

## 5. Project Architecture

```
├── supabase_schema.sql           # Complete PostgreSQL schema, RLS policies, & indexes
├── netlify.toml                  # Netlify build & SPA routing configuration
├── public/
│   └── _redirects                # Netlify SPA 200 redirect rule
├── src/
│   ├── components/               # UI components (Table, Modals, Stats, Login, SQL guide)
│   ├── context/                  # AuthContext (Supabase Auth, RBAC, Admin/Student)
│   ├── lib/
│   │   └── supabase.ts           # Supabase client singleton & credentials storage
│   ├── services/
│   │   └── supabaseRecordService.ts # Real-time PostgreSQL queries, mutations, & search
│   ├── types/                    # TypeScript interfaces & enums
│   ├── App.tsx                   # Main application orchestration
│   └── main.tsx                  # React DOM root
├── package.json
└── vite.config.ts
```
