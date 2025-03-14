<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# 📝 Tasks Management System  

A **multi-tenant SaaS-based** **Task Management System** built with **NestJS, GraphQL, and PostgreSQL**, allowing organizations (**tenants**) to manage users, assign tasks, and ensure strict data isolation between tenants.  

## 🚀 Tech Stack  

- **Backend:** [NestJS](https://nestjs.com/) (GraphQL, TypeORM)  
- **Database:** PostgreSQL (Multi-Tenant Architecture)  
- **Authentication:** JWT (JSON Web Token)  
- **Authorization:** Role-Based Access Control (RBAC)  
- **ORM:** TypeORM  
- **Validation:** class-validator  
- **Hashing:** bcrypt  
- **Guarding & Middleware:** Custom NestJS Guards for authentication & tenant isolation  

## ✨ Features  

✔ **Multi-Tenant Isolation:** Each organization (tenant) has its own users, tasks, and data. No cross-tenant access is allowed.  
✔ **Role-Based Access Control (RBAC):** Users can be **Admin, Manager, or Employee** with different permissions.  
✔ **Authentication & Authorization:** JWT-based authentication with GraphQL authentication guards.  
✔ **User Management:**  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 Admin can **invite, delete** Managers & Employees.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 Employees can only **view** assigned tasks.  
✔ **Task Management:**  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 Admins & Managers can **create, update, assign, and delete tasks**.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 Employees can **mark tasks as completed or pending**.  
✔ **GraphQL API:** Efficient and flexible API structure for querying only needed data.  
✔ **Database Security:** Passwords are **hashed** before saving (bcrypt).  
✔ **Middleware & Guards:**  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 **GqlAuthGuard** ensures **JWT authentication** in GraphQL requests.  
&nbsp;&nbsp;&nbsp;&nbsp;🔹 Custom guards enforce **tenant-based isolation**.  

## 🏗 Database Structure (PostgreSQL)  

The system follows **multi-tenant architecture**, ensuring **each tenant has isolated users and tasks**.  

📌 **Tables Overview:**  
1. **Tenants:** Stores organizations that use the system.  
2. **Users:** Stores Admins, Managers & Employees.  
3. **Tasks:** Stores tasks assigned to users within a tenant.  

### 🔹 **Entity Relations**  
- A **Tenant** ➝ has **multiple Users**.  
- A **Tenant** ➝ has **multiple Tasks**.  
- A **User** ➝ can be **Admin, Manager, or Employee**.  
- A **Task** ➝ is **created by Admin/Manager** & assigned to an **Employee**.  

## 🛠 API Endpoints (GraphQL Playground Queries)  

### 🟢 **Authentication**  
✅ **Sign Up (Creates first user as Admin & Tenant):**  
```graphql
mutation {
  signUp(email: "admin@example.com", password: "password123", tenantName: "Company A") {
    token
    user {
      id
      email
      role
      tenant {
        name
      }
    }
  }
}
```
✅ **Login (Get JWT Token)**  
```graphql
mutation {
  login(email: "admin@example.com", password: "password123") {
    token
    user {
      email
      role
    }
  }
}
```

### 🟢 **User Management**  
✅ **Invite User (Admin Only, Assigns Role & Ensures Tenant Isolation)**  
```graphql
mutation {
  inviteUser(inviteInput: { email: "manager@example.com", password: "securepass", role: MANAGER }) {
    id
    email
    role
  }
}
```
✅ **Delete User (Admin Only, Ensures Same Tenant)**  
```graphql
mutation {
  deleteUser(userId: "USER_UUID", tenantId: "TENANT_UUID")
}
```

### 🟢 **Task Management**  
✅ **Create Task (Only Admin/Manager Can Assign to Employee)**  
```graphql
mutation {
  createTask(createTaskInput: { title: "Task 1", description: "Complete the report", assignedToId: "USER_UUID", tenantId: "TENANT_UUID" }) {
    id
    title
    status
  }
}
```
✅ **Update Task Status (Employee Marks Completed/Pending)**  
```graphql
mutation {
  updateTaskStatus(taskId: "TASK_UUID", status: COMPLETED) {
    id
    title
    status
  }
}
```
✅ **Get Tasks by Tenant (Ensures Isolation)**  
```graphql
query {
  getTasksByTenant(tenantId: "TENANT_UUID") {
    id
    title
    assignedTo {
      email
      role
    }
    createdBy {
      email
      role
    }
  }
}
```

## 📜 Authorization Rules  

| Role      | Can Invite Users | Can Delete Users | Can Create Tasks | Can Assign Tasks | Can Mark Tasks Completed |  
|-----------|----------------|----------------|----------------|----------------|----------------|  
| **Admin** | ✅ Yes          | ✅ Yes        | ✅ Yes        | ✅ Yes        | ❌ No         |  
| **Manager** | ❌ No          | ❌ No        | ✅ Yes        | ✅ Yes        | ❌ No         |  
| **Employee** | ❌ No          | ❌ No        | ❌ No        | ❌ No        | ✅ Yes        |  

## 🔐 Security Measures  
✅ **JWT Authentication** for API requests.  
✅ **BCrypt Password Hashing** before storing in the database.  
✅ **Role-Based Authorization** using **Guards & Middleware**.  
✅ **Tenant Isolation** ensuring no cross-tenant access.  

## 🏗 How to Run the Project Locally  

### 1️⃣ **Clone the Repository**  
```sh
git clone https://github.com/yourusername/tasks-management-system.git
cd tasks-management-system
```

### 2️⃣ **Install Dependencies**  
```sh
npm install
```

### 3️⃣ **Set Up Environment Variables**  
Create a `.env` file and add the following:  
```
DATABASE_URL=postgres://your_db_user:your_db_password@localhost:5432/tasksdb
JWT_SECRET=your_secret_key
```

### 4️⃣ **Run Migrations & Start Server**  
```sh
npm run typeorm migration:run
npm run start:dev
```

### 5️⃣ **Access GraphQL Playground**  
Go to: **`http://localhost:3000/graphql`** to test API endpoints.

## 🎯 Future Enhancements  
- 📩 **Email Notifications for Invites & Task Updates**  
- 📊 **Task Reporting & Analytics**  
- 📱 **Frontend Integration with React/Next.js**  

---

## 📌 Conclusion  
The **Tasks Management System** provides a **secure, scalable, and tenant-isolated** task management solution for **SaaS-based organizations**. Admins can manage users, assign tasks, and ensure efficient collaboration—all while maintaining strict data security. 🚀  

💡 **Want to contribute?** Feel free to submit a PR or open an issue!  

