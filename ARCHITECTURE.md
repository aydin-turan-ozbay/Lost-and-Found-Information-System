# Project Architecture: Lost and Found Information System

## Change History

*You can see the repository history of the project in detail in the source control section.*

## Table of Contents

1. [Project Scope](#1-scope)
2. [References](#2-references)
3. [Software Architecture](#3-software-architecture)
4. [Architectural Goals & Constraints](#4-architectural-goals--constraints)
5. [Logical Architecture](#5-logical-architecture)
6. [Process Architecture](#6-process-architecture)
7. [Development Architecture](#7-development-architecture)
8. [Physical Architecture](#8-physical-architecture)
9. [Scenarios](#9-scenarios)
10. [Size and Performance](#10-size-and-performance)
11. [Quality](#11-quality)

  [Appendices](#appendices)

- [Acronyms and Abbreviations & Definitions](#acronyms-and-abbreviations--definitions)
- [Design Principles](#design-principles)

---

## List of Figures

| Figure No | Description | Section Reference |
| :--- | :--- | :--- |
| **Figure 1** | Entity Relationship Diagrams (Conceptual and Logical) | [3.3.1. Entity Relationship Diagram (ERD)](#331-entity-relationship-diagram-erd) |
| **Figure 2** | Component Diagram | [3.4. Dynamic Matching and Notification Service](#34-dynamic-matching-and-notification-service) |
| **Figure 3** | Sequence Diagram | [6.1. Sequence Diagram](#61-sequence-diagram) |
| **Figure 4** | Deployment Diagram | [8.3. Network & Connectivity](#83-network--connectivity) |
| **Figure 5** | Use Case Diagram | [9.1. Use Case Diagram](#91-use-case-diagram) |

---

## 1. Scope

This application is a digital platform that facilitates the tracking of lost and found items on a university campus. Users can register to the system and create listings with photos for items they have found or lost. Thanks to the smart search feature in the system, it is possible to find a searched item in seconds by typing a category or name. In addition, there is an administrator (Admin) panel that oversees the entire process; this makes lost item tracking fast, reliable, and highly organized.

---

## 2. References

The technology stack and tools used in the development, testing, and deployment phases of the project are as follows:

### 2.1. Programming Languages and Technologies

- **PHP 8.x:** Used as the core engine on the server side (Backend) for processing form data, session management, and performing database CRUD (Create, Read, Update, Delete) operations.
- **MySQL:** Chosen as the project's relational database management system (RDBMS). Data integrity is ensured by establishing Foreign Key relationships between the users and items tables.
- **Web Standards (HTML5, CSS3, JS):** Semantic HTML is used for interface design, customized CSS (`style.css`, `profile.css`) for style management, and client-side JavaScript for dynamic user interactions.
- **Drawio.com:** Used to visualize the database architecture **(ER Diagrams)** and system flowcharts of the project and to model the **logical** and **conceptual design.** [Draw.io](https://app.diagrams.net/)

### 2.2. Development and Server Environment

- **XAMPP Control Panel:** A software package used to simulate the Apache HTTP server and MariaDB/MySQL services on the local machine (localhost).
- **MySQL Workbench:** Used for designing database schemas, testing SQL queries, and visually managing table structures.
- **Visual Studio Code (VS Code):** The preferred integrated development environment (IDE) for managing the modular file structure and editing PHP/HTML files.

### 2.3. Version Control and Collaboration

- **Git & GitHub:** Used for team code synchronization, branch management, and tracking change history. So far, version tracking has been maintained on the project.

### 2.4. Other Research Sources
- **Visual Paradigm:** Used for UML modeling (Component, Sequence, Deployment, Use Case) & ERD design, and architectural visualization to ensure system consistency. [Visual Paradigm](https://www.visual-paradigm.com/)
- **GeeksforGeeks - ER Model:** Referenced for database normalization, cardinality constraints, and ERD standards during the data modeling phase. [GeeksforGeeks - ER Model](https://www.geeksforgeeks.org/introduction-of-er-model/)

---

## 3. Software Architecture

The project is built upon a **3-Tier Architecture** with clearly defined responsibilities, incorporating **Event-Driven** design principles.

### 3.1. Presentation Layer (Frontend)

- **Layer Details:** This layer manages user interactions using **HTML5, CSS3, and JavaScript (Fetch API)**.
- **Privacy Protocol:** To ensure user privacy, the frontend only displays the listings belonging to the logged-in user; a **public list of found items** is strictly prohibited.

### 3.2. Logic Layer (Backend)

- **Business Logic:** This is the business logic layer based on **PHP 8.x**.
- **Core Engine:** Beyond simple data persistence, this layer hosts the **_Bi-directional Intelligent Matching Engine_**.

### 3.3. Data Layer (Database)

- **RDBMS:** A **MySQL** relational database management system (RDBMS) is utilized.
- **Performance:** Data is stored in relational tables with **optimized indexes** (e.g., _T.C. ID Number, Item Category_) to ensure integrity and performance.

#### 3.3.1. Entity Relationship Diagram (ERD)

To visualize the data architecture and the logical connections between entities, the following ER diagrams represent the core of the system:

**Conceptual Design**
<p align="center">
  <img src="docs/diagrams/Lost_and_Found_ER_Diagram.png" alt="Component Diagram" width="1000">
</p>

**Logical Design**
<p align="center">
  <img src="docs/diagrams/Lost_and_Found_ER_Diagram2.png" alt="Component Diagram" width="1000">
</p>

#### 3.3.2. Relationship Analysis

The system architecture is built upon strategic relationships between four main tables. These relationships ensure data integrity while optimizing user experience and system automation capabilities.

- **User and Advertisement Relationship (Users ↔ Items):**
  - **Relationship Type:** 1:N (One-to-Many).
  - **Description:** A user can create multiple lost or found advertisements in the system; however, each advertisement belongs to only one user.
  - **Critical Point:** This link, established through the `user_id` field in the `Items` table, ensures that the owner of the item or the person who found it can be reached.

- **Security and Verification Relationship (Users ↔ OTP Tokens):**
  - **Relationship Type:** 1:N (One-to-Many).
  - **Description:** A user may request multiple OTP codes over time for processes such as registration or password reset.
  - **Critical Point:** This relationship is designed to ensure the security of user accounts and to automate email verification processes.

- **Smart Matching Mechanism (Items ↔ Match Records):**
  - This section is the most complex and vital part of the system. The `Match Records` table acts as a "bridge" managing the self-referencing relationship of the `Items` table.
  - **Relationship Type:** 1:N (Two Separate Connections).
    - **Triggers Match:** Defines the potential matches of the newly entered item (`item_id`) within the system.
    - **Matched With:** Represents the second item (`matched_item_id`) found by the algorithm that shows similarity to the first item.
  - **Critical Point:** This structure brings together a lost advertisement and a found advertisement, tracking the similarity score (`score`) between them. The `CHECK (item_id <> matched_item_id)` rule prevents logical errors by ensuring an item cannot be matched with itself.

> **Note:** The system design offers a relational structure covering all stages from the user's advertisement posting process to tracking the results of the smart matching algorithm and managing security protocols (OTP). Especially through the **Match Records** table, the matching process is managed transparently, allowing users to be informed quickly.

### 3.4. Dynamic Matching and Notification Service

- **Event Trigger:** The architecture utilizes every new data entry as a trigger.
- **Scanning Mechanism:** When a **"Lost"** report is submitted, all active **"Found"** records are scanned; conversely, when a **"Found"** item is reported, all active **"Lost"** listings are scanned asynchronously.
- **SMTP Notification:** If the matching algorithm produces a score exceeding the **70% threshold**, an instant notification email is dispatched to the user via the **SMTP protocol**.

The diagram below illustrates the high-level software architecture of the platform, utilizing a **decoupled, event-driven logical architecture**.

<p align="center">
  <img src="docs/diagrams/component_diagram.png" alt="Component Diagram" width="1000">
</p>

#### **Detailed Architecture Analysis**

**1. Presentation Layer (Frontend)**

**Web Browser Interface:** Renders static HTML/CSS, ensuring cross-browser compatibility. Responsible for displaying UI and capturing input.

- **Client-Side Logic:** (JS Engines) Performs **Form Validation** and manages **Dynamic Content** (Dashboard) without full-page reloads.

**2. Business Logic Layer (Backend)**

- **Authentication & Session Manager:** Handles secure registration, **BCRYPT Hashing**, and **Session Tracking**. Triggers the **OTP Service (SMTP)** on user registration.
- **Listing Management Service:** Manages the lifecycle of reports (CRUD) and **Photo Upload**.
- **Smart Matching Engine:** Executes the core **Weighted Scoring Algorithm** and **Cross-scanning** (comparing lost vs. found) upon receiving a new listing event. Flags matches exceeding the **70% Threshold**.
- **Admin Panel Logic:** Allows administrative oversight and **Final Delivery Approval**.

**3. Data Layer (Database)**

- **MySQL Relational Database:** Ensures normalized and secure data persistence (Users, Items, Match Records, OTP Tokens).

---

## 4. Architectural Goals & Constraints

### 4.1. Architectural Goals

- **Zero-Exposure Security Protocol:** The primary objective is to prevent the misuse of found items by ensuring these records are **never listed to end-users**, maintaining full confidentiality throughout the process.
- **Proactive Solution Generation:** Instead of functioning as a passive bulletin board that relies on manual user checks, the system is designed to act as an **active assistant** that reaches out to the user when a match score of **70% or higher** is achieved.
- **Persistent Data Correlation:** The system is aimed at **continuously scanning for matches** in the background even after a report is submitted. This ensures that any new incoming data is compared against existing records, keeping the user informed through an **_event-driven mechanism_**.
- **High Accessibility and Cross-Platform Flexibility:** A core architectural goal is to ensure the application runs with full performance and a **responsive design** on all campus devices (smartphones, tablets, laptops) via standard web browsers, without requiring any additional software or app installation.

### 4.2. Constraints (Technical and Operational Obligations)

- **Statistical Security Threshold (70% Threshold):** To prevent false-positive match notifications and system clutter, the automated notification mechanism is **strictly limited** to data with a similarity ratio of 70% or above.
- **Centralized Administrator (Admin) Approval:** Due to security protocols, regardless of the score generated by the algorithm, the physical return process of an item can only be finalized with **Admin approval**; this constitutes an operational constraint.
- **Data Privacy and Isolation:** To prevent unauthorized access or misuse, users are completely restricted from accessing other listings in the database. The system is constrained to show users only **their own reports** and specific match notifications directed to them.
- **Asynchronous Communication Requirement (Non-blocking):** To prevent the user interface from freezing during intensive matching queries, it is a technical necessity that all data exchange is performed **asynchronously via the Fetch API**.

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

The system runs a two-way matching algorithm to maintain database accuracy and increase the speed of finding lost items. When a new found item is entered into the system, it is cross-referenced with existing lost item listings in the background. Similarly, when a new lost item listing is created, the system automatically scans the existing found item listings. The following weighted scoring formula is used in this process:

$$Score = (CategoryMatch \times W_0) + (LocationMatch \times W_1) + (DateMatch \times W_2)$$

If the calculated score is above the threshold value, the system automatically sends a notification to potential item owners.

### 6.1. Sequence Diagram

This diagram illustrates the end-to-end operational flow of the system, covering authentication, automated matching, and the administrative delivery cycle.

<p align="center">
  <img src="docs/diagrams/sequence-diagram.png" alt="Sequence Diagram" width="1000">
</p>

### 6.2. Technical Description of the Sequence Diagram

The following detailed technical analysis breaks down the data flow across the decoupled layers of the **Smart Lost and Found Information System**:

#### A. Authentication and Login Process
The workflow initiates when the user interacts with the login interface:
* **Frontend:** Collects user credentials (Email/ID and Password), encapsulates them into a **JSON** object, and dispatches an asynchronous `POST` request using the **Fetch API**.
* **Backend:** Receives the request, queries the **MySQL** database to validate the user, and retrieves their specific role (Admin or Student).
* **Session Management:** Upon successful validation, a **Server-side Session** is established, granting the user access to a personalized, dynamic dashboard.

#### B. Item Posting and Smart Matching Engine
This phase represents the core "intelligence" of the system, designed to operate without disrupting the user experience:
* **Item Submission:** When a user creates a lost or found listing, the **JavaScript** engine transmits the form data to the PHP API.
* **Database Recording:** The Backend records the item entry in the `items` table with an **"Active"** status.
* **Asynchronous Matching:** Immediately after the record is saved, a background process (Matching Engine) is triggered. It scans the database for potential matches and calculates a similarity score based on the following algorithm:

$$Score = (CategoryMatch \times W_c) + (LocationMatch \times W_l) + (DescriptionSimilarity \times W_d)$$

* **Match Recording:** If the calculated score exceeds a predefined **threshold**, a record is automatically inserted into the `matches` table.

#### C. Admin Control and Delivery Process
The physical delivery and final archival of items are managed through the administrative interface:
* **Panel Access:** The **Admin (Security Personnel)** accesses the management dashboard where the Frontend fetches all active listings from the MySQL database.
* **Transaction Execution:** Once a physical handover occurs, the Admin submits the **Lost Item ID**, **Found Item ID**, and the receiver's identification.
* **Status Update:** The Backend executes a database transaction to update the status of both involved items to **"passive"** (delivered) simultaneously, ensuring data integrity.
* **UI Feedback:** The Frontend receives a success confirmation and instantly moves the transaction to the system archive.

---

## 7. Development Architecture

The development architecture is designed in a modular structure to ensure team collaboration and code maintainability.

### 7.1. Tech Stack

- **Languages:** PHP 8.x, HTML5, CSS3, Modern JavaScript (ES6+).
- **Database:** MySQL.
- **Development Tools:** VS Code, Apache (XAMPP).
- **Version Control:** GitHub. The entire development process is managed via GitHub to ensure code security and team synchronization.

### 7.2. File Organization and System Architecture

The project is structured in a layered folder hierarchy to facilitate team synchronization during development and make system maintenance sustainable.

**Root Directory Components:**

- **/docs:** The documentation layer containing the project's theoretical infrastructure, flowcharts, and use cases (diagrams).
- **ARCHITECTURE.md & README.md:** Main guides prepared for developers, containing the technical architecture and installation steps of the project.
- **.gitignore & .gitattributes:** Ensure the proper operation of the Git version control system and prevent the storage of unnecessary files (e.g., IDE configurations).

#### Detailed Analysis of src/ (Application Source Code)

All dynamic and static components of the application are gathered under the `src/` directory:

- **`/assets` (Static Resources):**
  - `/css`: `style.css`, `profile.css`, and `report_item.css`.
  - `/js`: JavaScript engines for form controls and dynamic listings.
  - `/images`: Secure storage for the system logo and user-uploaded item photos.
- **`/frontend` (Presentation Layer):** Forms and skeletons for `login`, `register`, `dashboard.html`, and `report_item.html`.
- **`/backend` (Business Logic Layer):**
  - `db_config.php`: Secure database connection bridge.
  - `login.php` & `register.php`: Authentication and OTP services.
  - `report_item.php`: Records new listings and triggers the matching algorithm.
  - `logout.php`: Securely terminates sessions.
- **`/database` (Data Layer):** `schema.sql` containing table structures and initial seeds.
- **`/docs`:** Documentation layer containing flowcharts and use cases.

### 7.3. Collaboration and Version Control

The entire development process was managed via GitHub to ensure code security, team synchronization, and systematic version tracking. The key advantages provided by this infrastructure are:

- **Chronological Development Log:** Through the consistent use of Git, every development phase was recorded with detailed commit messages, creating a transparent and traceable history of the project's evolution.
- **Stability and Debugging:** The version control system facilitated the debugging process by allowing the team to revert to previous states when necessary, ensuring that stable versions of the project were always secured.
- **Parallel Development (Decoupled Efficiency):** The architectural separation of the Frontend and Backend layers allowed Ali Kemal, Aydın, and the rest of the team to work on different modules simultaneously. This decoupled structure ensured that team members could develop and test their respective components independently without interfering with each other's code.

---

## 8. Physical Architecture

### 8.1. Server-Side Components

- **Hosting Environment:** The application is hosted on a centralized server within the campus network. During the development phase, the **XAMPP (Apache, MySQL, PHP)** local server environment was utilized.
- **Web Server (Apache):** Handles incoming HTTP/HTTPS requests from users, executes PHP scripts, and delivers static files (**HTML, CSS, JS**) to the client.
- **Database Server (MySQL):** Securely stores lost and found item data, user accounts, and matching records.
- **Mail Server (SMTP Relay):** Responsible for **automated email dispatch** to users whenever a match score of 70% or higher is achieved.

### 8.2. Client-Side Components

The system does not require any application installation. Users can access the system through the following physical devices:

- **Mobile Devices:** Smartphones and tablets (**iOS/Android**).
- **Desktop/Laptop Computers:** Campus laboratory terminals or personal computers.
- **Browser:** Modern web browsers (**_Chrome, Firefox, Safari_**) serve as the primary execution environment for all operations.

### 8.3. Network & Connectivity

- **Agnostic Connectivity Support:** The application architecture is designed to be **network-agnostic**, functioning independently of the physical connection type. The system provides uninterrupted service over campus local networks (**Wi-Fi/Ethernet**), home internet (ADSL/Fiber), public access points, and mobile data (**3G/4G/5G**) services from all operators.
- **Low Bandwidth Optimization:** Through **Fetch API** and **JSON-based asynchronous data transfer**, the system continues to operate without data loss or UI freezing even on low-speed or unstable connections (e.g., weak mobile signals).
The physical deployment of the system is configured to ensure high availability and data security within the campus network. The architecture consists of three main components: **end-user devices, network infrastructure, and a centralized application server.**

The diagram below illustrates the high-level physical deployment of the platform, highlighting the interaction between **End-User Devices**, **Campus Network**, and the **Server Tier**.

<p align="center">
  <img src="docs/diagrams/Deployment_Diagram.jpeg" alt="Integrated Deployment Diagram" width="1000">
</p>

#### **Detailed Architecture Analysis**

**1. End-User Client Tier (Presentation Layer)**

- **Web Browser Interface:** Users access the platform via modern browsers on diverse devices (iOS/Android smartphones, Laptops/Workstations).
- **Asynchronous Communication:** All data exchange is performed over **HTTPS** using the **Fetch API**, ensuring that JSON-based payloads are processed without blocking the UI.

**2. Centralized Server Tier (Application & Web Layer)**

- **Apache Web Server:** Executes the **PHP 8.x** backend logic and manages incoming HTTP/HTTPS requests.
- **Core Logic Services:** Manages critical operations such as **Role-Based Access Control (RBAC)**, listing lifecycles, and secure session management.
- **Intelligent Match Algorithm:** An event-driven engine that performs weighted scoring. If a match exceeds the **70% Threshold**, it triggers the **SMTP Email Relay Server** for instant user notification.

**3. Data Management Tier (Database Layer)**

- **MySQL Relational Database:** Provides secure and persistent storage using a normalized schema.
- **Key Tables:** The database is structured into four primary tables: **Items**, **Users**, **Matched Records**, and **OTP Tokens**.

#### **Security and Design Integrity**

- **Zero-Exposure Security:** To prevent misuse, item records are never listed publicly; the system relies on automated matches.
- **Data Protection:** The architecture enforces **BCRYPT Hashing** for passwords and utilizes strict input filtering to prevent **XSS** and **SQL Injection** attacks.
- **Architectural Principles:** By adhering to **Separation of Concerns (SoC)** and **Event-Driven Execution**, every new report triggers an immediate, background-processed matching sequence.

---

## 9. Scenarios

This section describes the end-to-end operational flow of the system, highlighting the interaction between the Frontend (JS), Backend (PHP API), and MySQL Database.

### Scenario 1: Posting a Lost Item (Student/User)

- **Action:** A student logs into the platform via `login.html.` The `auth.js` script verifies the session.
- **Process:** The student fills out the "Post Item" form, providing a mandatory date and an optional time.
- **Technical Flow:** Upon submission, JavaScript intercepts the event, collects data using the `FormData` object, and sends an asynchronous request to `backend/post_item.php` via the Fetch API.
- **Result:** The Backend validates the input and stores the data in the MySQL `items` table. The user is then dynamically redirected to `my_adverts.html` to view their active listing.

### Scenario 2: Smart Matching and Notification (System)

- **Action:** A user posts a "Found" item listing.
- **Process:** Immediately after the database update, the backend matching engine is triggered as an **Event-Driven** process.
- **Technical Flow:** The system compares the new entry against existing "Lost" items using a **Weighted Scoring Algorithm**
- **Result:** If the calculated Score exceeds the **70% threshold**, the system creates a record in the `match_records` table and displays a proactive notification on both users' dashboards.

### Scenario 3: Secure Password Recovery (User)

- **Action:** A user clicks "Forgot Password" on the login page.
- **Process:** The user provides their registered email address in `forgot_password.html`.
- **Technical Flow:** The backend generates a unique, time-sensitive **Security Token** and stores it in the MySQL database. An email containing a reset link is dispatched via **SMTP**.
- **Result:** The user follows the link to `reset_password.html` to update credentials. The token is invalidated immediately after use to ensure maximum system security.

### Scenario 4: Controlled Delivery Management (Admin)

- **Action:** The Admin navigates to the "Delivery" section in the `admin_panel.html`.
- **Process:** The Admin selects the recipient using a searchable dropdown filtered by **T.C. Identification Number**.
- **Technical Flow:** The admin enters the unique IDs of the matched items. The `backend/deliver_item.php` script updates the status of both items from **Active** to **Passive**.
- **Result:** Once delivery is confirmed, the relevant listing is moved from the **"My Active Listings"** tab to the **"My Found Items / My Past Listings"** tab in the user's dashboard.The records are not deleted from the system; they remain stored in the database as proof of delivery and a transaction history for both the user and the administrator.

#### 9.1. Use Case Diagram

-To visualize the functional boundaries and interaction patterns of the platform, the following Use Case Diagram illustrates the relationship between users, administrative staff, and core system services. This model highlights the **event-driven** nature of the matching engine and the security-first approach integrated into the user workflows.

<p align="center">
  <img src="docs\diagrams\Lost_ and_ Found_ Platform Use-Case Diagram.png" alt="Use-Case Diagram" width="1000">
</p>

#### **Detailed Architecture Analysis**

**1. USER WORKFLOW**

- **Register & Login:** Access is governed by strict security protocols. Registration requires **email-based OTP Verification via SMTP** with **"include"**. During login, credentials are authenticated using **BCrypt validation (hashing)** to ensure data security.
- **Reset Password:** For forgotten passwords, the system generates a time-limited, unique **Security Token**; this process is an integral part of the password reset use case (**"include"**).
- **Dashboard and Extend Relationship:** The Dashboard use case is linked to **"My Active Listings"** and **"My Past Listings"** via **"extend"** relationships. This indicates that these views are loaded upon user request, providing a flexible and performance-oriented interface.
- **Report Lost/Found Item:** Users can create listings. For **"Found Items,"** a mandatory photo upload is enforced. Critically, as soon as the database is updated, the system triggers the matching engine as an asynchronous, **Event-Driven** process.
- **Receive Matching Notification:** Once a match is identified, the user receives an automated notification via the **SMTP** protocol.
  
**2. Smart Matching Engine (System Service)**

- **Execute Weighted Scoring Algorithm:** Triggered automatically upon new item submission.It calculates a similarity score based on Category, Location, and Date parameters.
- **Scan Active Lost/Found Items:** Performs **cross-scanning** across all active records in the database.
- **Log Match Record:** If the calculated score meets the threshold (≥ 70%), the system automatically updates the **"match_records (bridge table)"** and initiates the notification flow.

> **Note:** The relationship line from the Admin to the **Execute Weighted Scoring Algorithm** indicates that the Admin utilizes the algorithm's output as a **decision support mechanism** during the approval process rather than triggering the algorithm manually.

**3. Admin (Security Officer) Workflow**

- **Admin Panel:** It is the system's general management interface.
- **Manage Listings (CRUD):** The Admin has full authority to perform CRUD (Create, Read, Update, Delete) operations on all listings to maintain system integrity.
- **Perform Smart Search:** Unlike regular users, the Admin has the authority to search the entire database using critical parameters such as **T.C. Identification Number** or **Category**. This is essential for verifying recipients during physical delivery.
- **Approve Delivery:** Physical delivery is strictly tied to Admin approval. Upon confirmation `(deliver_item.php)`, the Admin updates the item status from **"Active"** to **"Passive/Past."**
- **Generate Transaction History / Audit Trail:** Upon delivery approval, the system generates a dual-purpose record:
  - **Transaction History (User-Oriented):** A functional record of the transfer (visible under the user's **"My Past Listings"** tab).
  - **Audit Trail (Security-Oriented):** A technical log documenting which Admin performed the action, the timestamp, and the security protocols used.

> **Note:** The system generates a Transaction History for every successful delivery; this record simultaneously serves as a digital **Audit Trail** for the security department, ensuring full traceability and transparency of the entire process.

---

## 10. Size and Performance

The system is engineered for efficiency, utilizing a lightweight architecture to ensure high responsiveness and low resource consumption.

### 10.1. System Size

- **Lightweight Codebase:** By separating concerns into `/frontend` and `/backend`, redundant code has been eliminated. The application maintains a minimal footprint, consisting primarily of optimized script files and lean HTML structures.
- **Data Efficiency:** The MySQL database is designed with optimized data types (e.g., `INT` for IDs, `DATETIME` for timestamps, and `VARCHAR` for strings) to minimize disk space usage while maintaining data integrity.
- **Asset Management:** The `/assets` folder is strictly reserved for essential media, such as the corporate logo. This keeps the initial load size very small, as decorative elements are handled via CSS within the frontend directory.

### 10.2. Performance Metrics

- **Low Latency Communication:** Using the **Fetch API** to exchange only JSON data (rather than full HTML pages) reduces network traffic by up to **70%**. This results in near-instantaneous UI updates and transitions.
- **Search Optimization:** Admin searches are performed on **indexed columns** (specifically the T.C. Identification Number). This ensures that even with a database of thousands of students,search results are returned in milliseconds.
- **Concurrency and Scalability:** When a user creates a new listing, the system executes the cross-matching algorithm in the background. Thanks to the **asynchronous** nature of the Fetch API, the User Interface (Frontend) remains unblocked, providing a smooth experience even under high traffic conditions.
- **Server Response Time:** API endpoints are optimized for speed, aiming for a response time of **less than 100ms** per request under normal campus network load conditions.

---

## 11. Quality

### 11.1. Security & Privacy

- **Identity Verification (OTP):** The One-Time Password (OTP) system sent to the user's email address during registration prevents fake accounts and verifies user identity upfront.
- **Confidentiality:** There is no direct communication between the losing and finding parties. The entire process is conducted via the **Campus Security Unit**, preserving user anonymity.
- **RBAC (Role-Based Access Control):** The **_"Principle of Least Privilege"_** is applied. The Admin (Security) can access all data, while users can only see their own listings.
- **Data Protection:** Passwords are hashed using **BCRYPT**; all form inputs are cleaned against **SQL Injection** and **XSS attacks.**

### 11.2. Reliability & Integrity

- **Two-Step Verification:** The verification information sent to the user via email after a match is checked by the security officer during the physical delivery process.
- **Visual Proof:** The mandatory photo upload for "Found Item" reports increases the accuracy and evidentiary value of the data in the system.
- **Transaction Consistency:** Database operations work cohesively to prevent data loss during **reporting and matching.**

### 11.3. Performance & Efficiency

- **Automated Matching Engine:** _The Matching Algorithm_, which runs when a new lost or found listing is entered, digitizes the manual search process by calculating the similarity score between listings and minimizes the **_MTTR (Mean Time To Recover)_**.
- **Proactive Email Notification:** Without the need for the user to constantly check the system, instant and proactive notifications are provided via the Email Notification Service for matches exceeding the 70% threshold.
- **Database Indexing:** Category and location-based indexing ensure fast querying even with a high volume of records.

### 11.4. Usability & UX

- **Personalized Interfaces:** Dashboard menus customized by user's role.
- **Mobile Responsiveness:** All interfaces are mobile-responsive so the system can be easily used anywhere on campus at any time.
- **Location-Based Filtering:** Customized categorization based on campus buildings increases search accuracy.

### 11.5. Maintainability & Audit

- **Modular Architecture:** Backend logic (matching algorithm, notification service, DB connection) consists of _independent modules_, making development and debugging straightforward.
- **Audit Trail:** Every delivery transaction is logged with the receiver, the approving officer, and a timestamp, creating a secure digital audit trail.

---

## Appendices

### Acronyms and Abbreviations & Definitions

| Term                            | Definition                                                                                                                                                                         |
| :------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Asynchronous (Non-blocking)** | A method where operations run independently without waiting for each other. This ensures the UI remains responsive while the Fetch API performs matching in the background.        |
| **BCRYPT**                      | A password-hashing function based on the Blowfish cipher, used to securely store user credentials in a non-reversible format.                                                      |
| **Endpoint**                    | Specific URLs or server-side scripts (e.g., `login.php`) that act as a gateway for the Frontend to communicate with the Backend.                                                   |
| **Event-Driven**                | A software architecture paradigm where the flow of the program is determined by events, such as a new data entry triggering the matching algorithm.                                |
| **Fetch API**                   | A modern JavaScript interface for making asynchronous HTTP requests to the server without requiring a full page reload.                                                            |
| **Hashing**                     | The process of converting data (passwords) into a fixed-length string of characters that cannot be reversed, ensuring security even if the database is compromised.                |
| **MTTR**                        | _Mean Time To Recover._ In this context, it refers to the average time taken from the moment an item is reported lost to its successful recovery.                                  |
| **OTP**                         | _One-Time Password._ A unique, time-sensitive code sent via email to verify a user's identity during the registration or password recovery process.                                |
| **Payload**                     | The essential part of a transmitted data package. In this project, it refers to the JSON data sent within an HTTP request (e.g., item details).                                    |
| **RBAC**                        | **Role-Based Access Control.** A security mechanism that restricts system access to authorized users based on their roles (e.g., Admin vs. Student).                               |
| **RDBMS**                       | **Relational Database Management System.** A database engine (like MySQL) that organizes data into tables linked by defined relationships.                                         |
| **SMTP**                        | **Simple Mail Transfer Protocol.** The technical standard for transmitting automated email notifications from the application server.                                              |
| **UX**                          | **User Experience.** The overall experience of a person using the application, optimized in this project through responsive design and asynchronous updates.                       |
| **XSS**                         | **Cross-Site Scripting (XSS):** A security vulnerability whereby malicious scripts are injected into trusted websites; in this project, this is prevented through input filtering. |

### Design Principles

- **Single Responsibility Principle (SRP)**
- **Event-Driven Execution**
- **Non-Blocking Communication (Asynchrony)**
- **Separation of Concerns (SoC)**
- **Layered Architecture**
- **Principle of Least Privilege (PoLP)**
- **Decoupled Frontend-Backend**
- **High Cohesion / Low Coupling**
- **Simplicity**
- **Zero-Exposure Strategy**
- **Normalized Data Design**
