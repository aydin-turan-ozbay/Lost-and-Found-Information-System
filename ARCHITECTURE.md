# Project Architecture:  Lost and Found Information System

## 1. Scope
This application is a digital platform that facilitates the tracking of lost and found items on a university campus. Users can register to the system and create listings with photos for items they have found or lost. Thanks to the smart search feature in the system, it is possible to find a searched item in seconds by typing a category or name. In addition, there is an administrator (Admin) panel that oversees the entire process; this makes lost item tracking fast, reliable, and highly organized.

---

## 2. References
The technology stack and tools used in the development, testing, and deployment phases of the project are as follows:

### 2.1. Programming Languages and Technologies
*   **PHP 8.x:** Used as the core engine on the server side (Backend) for processing form data, session management, and performing database CRUD (Create, Read, Update, Delete) operations.
*   **MySQL:** Chosen as the project's relational database management system (RDBMS). Data integrity is ensured by establishing Foreign Key relationships between the users and items tables.
*   **Web Standards (HTML5, CSS3, JS):** Semantic HTML is used for interface design, customized CSS (`style.css`, `profile.css`) for style management, and client-side JavaScript for dynamic user interactions.

### 2.2. Development and Server Environment
*   **XAMPP Control Panel:** A software package used to simulate the Apache HTTP server and MariaDB/MySQL services on the local machine (localhost).
*   **MySQL Workbench:** Used for designing database schemas, testing SQL queries, and visually managing table structures.
*   **Visual Studio Code (VS Code):** The preferred integrated development environment (IDE) for managing the modular file structure and editing PHP/HTML files.

### 2.3. Version Control and Collaboration
*   **Git & GitHub:** Used for team code synchronization, branch management, and tracking change history. So far, version tracking has been maintained with 38 commits on the project.

---
## 3. Software Architecture





---
## 4. Architectural Goals & Constraints





---

## 5. Logical Architecture
The system is built on a **3-Tier logical architecture** where responsibilities are clearly separated. This structure ensures that each layer focuses on its area of expertise and keeps the system modular:

1.  **Presentation Layer (Frontend):** The layer that directly interacts with the user. It consists of HTML, CSS, and JavaScript files gathered under the `frontend` folder. Rather than processing data, it visualizes the raw data coming from the Backend.
2.  **Business Logic Layer (Backend):** Positioned as the "brain" of the system, this is the PHP layer located in the `backend` folder. It manages critical processes such as user authorization, listing verification, and executing the smart matching algorithm.
3.  **Data Layer (Database):** The MySQL database where all data is securely kept in a relational structure. User profiles, listing details, and match records are stored here.

---

## 6. Process Architecture
During runtime, the system follows an asynchronous and data-driven process flow. The main processes are:

### Asynchronous Data Communication
The user interface communicates with the server without fully refreshing the page (Refresh-free). Requests are sent to the Backend using the JavaScript **Fetch API**, and the server returns data solely in JSON format. This process accelerates and streamlines the user experience (UX).

### Authentication and Session Management
When the login process is successfully completed, PHP initiates a session on the server side. This session information allows the Navbar and access privileges to change dynamically based on the user's role in the system (Admin/Student).

### Smart Matching Process
The system runs a two-way matching algorithm to maintain database accuracy and increase the speed of finding lost items. When a new found item is entered, it is cross-referenced with existing lost items. The following weighted scoring formula is used:

$$Score = (CategoryMatch \times W_0) + (LocationMatch \times W_1) + (DateMatch \times W_2)$$

If the calculated score is above the threshold value, the system automatically sends a notification to potential item owners.

---

## 7. Development Architecture
The development architecture is designed in a modular structure to ensure team collaboration and code maintainability.

### 7.1. Tech Stack
*   **Languages:** PHP 8.x, HTML5, CSS3, Modern JavaScript (ES6+).
*   **Database:** MySQL.
*   **Development Tools:** VS Code, Apache (XAMPP).
*   **Version Control:** GitHub.

### 7.2. File Organization and System Architecture
All dynamic and static components of the application are gathered under the `src/` directory:

*   **`/assets` (Static Resources):** 
    *   `/css`: `style.css`, `profile.css`, and `report_item.css`.
    *   `/js`: JavaScript engines for form controls and dynamic listings.
    *   `/images`: Secure storage for the system logo and user-uploaded item photos.
*   **`/frontend` (Presentation Layer):** Forms and skeletons for `login`, `register`, `dashboard.html`, and `report_item.html`.
*   **`/backend` (Business Logic Layer):** 
    *   `db_config.php`: Secure database connection bridge.
    *   `login.php` & `register.php`: Authentication and OTP services.
    *   `report_item.php`: Records new listings and triggers the matching algorithm.
    *   `logout.php`: Securely terminates sessions.
*   **`/database` (Data Layer):** `schema.sql` containing table structures and initial seeds.
*   **`/docs`:** Documentation layer containing flowcharts and use cases.

### 7.3. Collaboration and Version Control
Through the use of GitHub:
*   Every development is recorded with commit messages.
*   The decoupled structure of Frontend and Backend layers allows independent development.

---

## 8. Physical Architecture





---

## 9. Scenarios
### Scenario 1: Posting a Lost Item (Student/User)
*   **Action:** User logs in via `login.html`.
*   **Technical Flow:** JS intercepts the form submission, collects data via `FormData`, and sends an asynchronous request to `backend/post_item.php` via Fetch API.
*   **Result:** Data is stored in MySQL and the user is redirected to `my_adverts.html`.

### Scenario 2: Smart Matching and Notification (System)
*   **Action:** User posts a "Found" item.
*   **Process:** Matching engine triggers immediately after the DB update.
*   **Result:** If the Score exceeds the threshold, notifications appear on dashboards.

### Scenario 3: Secure Password Recovery (User)
*   **Action:** User clicks "Forgot Password".
*   **Technical Flow:** Backend generates a time-sensitive Security Token. An email reset link is dispatched via SMTP.
*   **Result:** Token is invalidated immediately after use.

### Scenario 4: Controlled Delivery Management (Admin)
*   **Action:** Admin navigates to the "Delivery" section.
*   **Technical Flow:** Admin enters IDs of matched items; `backend/deliver_item.php` updates status from active to passive.
*   **Result:** Items move to "Past Listings" and are stored as transaction history.

---

## 10. Size and Performance
*   **Lightweight Codebase:** Separation of concerns eliminates redundant code.
*   **Data Efficiency:** Optimized MySQL data types (INT, DATETIME, VARCHAR) minimize disk usage.
*   **Low Latency:** JSON-only data exchange via Fetch API reduces network traffic by up to 70%.
*   **Search Optimization:** Admin searches are performed on indexed columns (T.C. Number) for millisecond response times.

---

## 11. Quality Attributes

### 11.1. Security & Privacy
*   **Identity Verification:** OTP system during registration prevents fake accounts.
*   **Confidentiality:** No direct communication between parties; process is handled via the Campus Security Unit.
*   **RBAC:** Role-Based Access Control via the "Principle of Least Privilege."
*   **Data Protection:** Passwords hashed using **BCRYPT**; inputs sanitized against SQL Injection and XSS.

### 11.2. Reliability & Integrity
*   **Two-Step Verification:** Security officer checks verification info during physical delivery.
*   **Visual Proof:** Mandatory photo uploads increase data accuracy.

### 11.3. Performance & Efficiency
*   **Automated Matching:** Minimizes MTTR (Mean Time To Recover).
*   **Proactive Notifications:** Instant alerts for matches exceeding a 70% threshold.

### 11.4. Usability & UX
*   **Personalized Interfaces:** Dashboard menus customized by role.
*   **Mobile Responsiveness:** Accessible anywhere on campus.

### 11.5. Maintainability & Audit
*   **Modular Architecture:** Independent modules for easy debugging.
*   **Audit Trail:** Every delivery transaction is logged with the receiver, approving officer, and timestamp.