# Blog App Fullstack Project

---

# 1. Project Overview

## Project Name

```text
Blog App Fullstack System
```

---

## Project Goal

Xây dựng một Blog App Fullstack hiện đại với:

- Frontend bằng React + TypeScript
- Backend bằng NestJS
- Database PostgreSQL
- ORM sử dụng TypeORM

Project được xây dựng để:

- học Fullstack Development
- hiểu frontend/backend integration
- hiểu authentication flow
- hiểu database relationship
- luyện kỹ năng tổ chức project thực tế
- xây dựng portfolio project

---

# 2. Tech Stack

# Frontend

| Technology       | Purpose            |
| ---------------- | ------------------ |
| React            | Frontend Framework |
| TypeScript       | Type Safety        |
| Tailwind CSS     | Styling            |
| React Router DOM | Routing            |
| Axios            | API Requests       |
| lucide-react     | Icons              |

---

# Backend

| Technology | Purpose           |
| ---------- | ----------------- |
| NestJS     | Backend Framework |
| TypeScript | Type Safety       |
| TypeORM    | ORM               |
| PostgreSQL | Database          |
| JWT        | Authentication    |
| bcrypt     | Password Hashing  |

---

# Database Tool

| Tool     | Purpose             |
| -------- | ------------------- |
| pgAdmin4 | Database Management |

---

# 3. Project Philosophy

Project này được xây dựng theo hướng:

```text
Clean
Minimal
Readable
Maintainable
Portfolio-ready
```

Mục tiêu KHÔNG phải:

- quá nhiều animation
- quá nhiều feature phức tạp
- microservice quá sớm

Mục tiêu là:

- hiểu flow thực tế
- hiểu cách frontend và backend hoạt động cùng nhau
- hiểu architecture
- hiểu CRUD + Auth + Database

---

# 4. Main Features

# Authentication

- Register
- Login
- Logout
- Refresh Token
- Protected Routes

---

# User Features

- View profile
- Update profile
- Change password

---

# Blog Features

- Create post
- Update post
- Delete post
- View posts
- Search posts
- Pagination
- Categories

---

# Comment Features

- Add comment
- Delete comment
- Reply comment

---

# Like Features

- Like post
- Unlike post

---

# 5. Frontend Architecture

Frontend structure:

```text
src/
│
├── components/
│   ├── ui/
│   ├── blog/
│   ├── layout/
│
├── pages/
│
├── services/
│
├── hooks/
│
├── store/
│
├── routes/
│
├── types/
│
├── utils/
│
└── App.tsx
```

---

# Frontend Responsibilities

Frontend chịu trách nhiệm:

- UI rendering
- routing
- form handling
- API integration
- authentication state
- responsive design

---

# 6. Backend Architecture

Backend structure:

```text
src/
│
├── auth/
├── users/
├── posts/
├── comments/
├── categories/
├── likes/
├── common/
├── config/
├── database/
│
├── app.module.ts
└── main.ts
```

---

# Backend Pattern

```text
Controller
↓
Service
↓
Repository
↓
Database
```

---

# Backend Responsibilities

Backend chịu trách nhiệm:

- authentication
- authorization
- business logic
- validation
- database operations
- security
- API responses

---

# 7. Database Design Overview

# Main Entities

- User
- Post
- Comment
- Category
- Like

---

# Relationships

## User → Posts

```text
One-to-Many
```

---

## Post → Comments

```text
One-to-Many
```

---

## Post ↔ Categories

```text
Many-to-Many
```

---

## User ↔ Likes

```text
One-to-Many
```

---

# 8. Authentication Flow

```text
User Login
↓
Backend verifies credentials
↓
Generate JWT access token
↓
Generate refresh token
↓
Frontend stores token
↓
Frontend sends Authorization header
↓
Backend Guard verifies token
↓
Allow access
```

---

# 9. API Communication

Frontend giao tiếp backend thông qua:

```text
Axios
```

---

# Example API Flow

```text
React Form
↓
Axios Request
↓
NestJS Controller
↓
Service
↓
TypeORM Repository
↓
PostgreSQL
↓
JSON Response
↓
React UI Update
```

---

# 10. UI/UX Direction

Frontend design style:

```text
Minimal Modern Blog UI
```

Lấy cảm hứng từ:

- Medium
- Dev.to
- Hashnode

---

# UI Priorities

- readability
- spacing
- typography
- responsive layout
- clean UI

Không ưu tiên:

- flashy animation
- complex effects
- overloaded UI

---

# 11. Coding Principles

# Frontend Principles

- reusable components
- clean folder structure
- responsive first
- separate UI and logic
- avoid duplicated code

---

# Backend Principles

- controller không chứa business logic
- service xử lý logic
- DTO validate dữ liệu
- guard bảo vệ routes
- repository thao tác database
- environment variables cho secrets

---

# 12. Development Rules

# Frontend

- dùng TypeScript đúng cách
- tránh any
- reusable UI components
- responsive design
- dùng Tailwind clean

---

# Backend

- sử dụng DTO validation
- sử dụng JWT Guard
- hash password bằng bcrypt
- không expose password
- sử dụng TypeORM relationships đúng cách

---

# Database

- dùng migration
- không dùng synchronize trong production
- đặt tên table rõ ràng
- hiểu SQL phía sau ORM

---

# 13. AI Agent Context

AI Agent hỗ trợ project cần hiểu:

## Developer Level

Developer hiện tại biết:

- React
- TypeScript
- Tailwind CSS
- NestJS
- TypeORM
- PostgreSQL
- pgAdmin4

Nhưng vẫn đang học:

- architecture
- authentication flow
- project organization
- advanced database design
- clean code
- fullstack integration

---

# AI Agent Responsibilities

AI Agent cần:

- giải thích logic thay vì chỉ đưa code
- giải thích request lifecycle
- giải thích TypeORM relationships
- giải thích frontend/backend interaction
- giải thích JWT flow
- giải thích state management
- giải thích responsive layout
- giải thích SQL phía sau ORM
- giúp refactor code sạch hơn
- giúp debug lỗi

---

# AI Agent Restrictions

AI Agent KHÔNG nên:

- over-engineer project
- thêm microservice quá sớm
- thêm architecture quá phức tạp
- dùng công nghệ ngoài stack hiện tại
- thêm feature vượt quá khả năng hiện tại

---

# 14. Final Goal

Sau khi hoàn thành project, developer cần hiểu:

```text
React + NestJS integration
Authentication system
JWT flow
CRUD operations
TypeORM relationships
REST API design
Database structure
Responsive frontend
Project architecture
Clean code practices
```

---

# 15. Future Improvements

Sau khi hoàn thành version hiện tại có thể học thêm:

- Redis
- Docker
- CI/CD
- Realtime features
- Rich text editor
- Cloud deployment
- Unit testing
- E2E testing
