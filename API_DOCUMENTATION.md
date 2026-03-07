# API Documentation

## Overview

The DPRIDE International School API provides endpoints for managing students, academic records, authentication, and content. All API routes are located in the `app/api/` directory.

## Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Students](#students)
  - [Academics](#academics)
  - [Results](#results)
  - [Notifications](#notifications)
  - [Contact & Applications](#contact--applications)

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

Most endpoints require authentication. The API uses NextAuth.js with JWT strategy.

### Authentication Methods

1. **Session-based (Browser)**
   - Automatically handled by NextAuth.js
   - Session cookie included in requests

2. **API Token (Future)**
   - Not yet implemented
   - Planned for external integrations

### Protected Routes

All routes under `/api/students`, `/api/academics`, `/api/reports`, and `/api/notifications` require authentication.

Role-based access:
- **Administrator**: Full access
- **Teacher**: Read access + grade entry
- **Parent**: Read-only for own children
- **Student**: Read-only for own records

## Error Handling

### Standard Error Response

```typescript
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* optional details */ },
  "timestamp": "2024-03-02T10:00:00.000Z"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

### Error Codes

- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid request data
- `VALIDATION_ERROR` - Input validation failed
- `CONFLICT` - Resource conflict (e.g., duplicate)
- `INTERNAL_ERROR` - Server error

## Rate Limiting

**Status**: Not yet implemented

Planned limits:
- Authentication endpoints: 5 requests per minute
- API endpoints: 100 requests per minute
- Public endpoints: 60 requests per minute

## Endpoints

### Authentication Endpoints

#### POST `/api/auth/signin`

Authenticate a user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "roles": ["Administrator"]
  },
  "expires": "2024-12-31T00:00:00.000Z"
}
```

#### GET `/api/auth/session`

Get current session.

**Response:**

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "roles": ["Administrator"]
  },
  "expires": "2024-12-31T00:00:00.000Z"
}
```

### Students

#### GET `/api/students`

List students with pagination and search.

**Authorization:** Administrator, Teacher

**Query Parameters:**

```
page: number (default: 1)
limit: number (default: 20, max: 100)
search: string (optional - searches admission no, name)
```

**Response:**

```json
{
  "students": [
    {
      "id": "student_id",
      "admissionNo": "DPS2024001",
      "firstName": "John",
      "lastName": "Doe",
      "middleName": "Smith",
      "sex": "M",
      "birthDate": "2010-01-01T00:00:00.000Z",
      "classId": 1,
      "sessionId": 1,
      "class": {
        "id": 1,
        "name": "Primary 1"
      },
      "session": {
        "id": 1,
        "name": "2024/2025"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### POST `/api/students`

Create a new student.

**Authorization:** Administrator

**Request Body:**

```json
{
  "admissionNo": "DPS2024001",
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "Smith",
  "sex": "M",
  "birthDate": "2010-01-01",
  "classId": 1,
  "sessionId": 1
}
```

**Response:** `201 Created`

```json
{
  "id": "student_id",
  "admissionNo": "DPS2024001",
  "firstName": "John",
  "lastName": "Doe",
  // ... full student object
}
```

### Academics

#### GET `/api/academics/classes`

List all classes.

**Authorization:** Authenticated

**Response:**

```json
{
  "classes": [
    {
      "id": 1,
      "name": "Primary 1",
      "departmentId": 1,
      "level": "Primary",
      "department": {
        "id": 1,
        "name": "Primary Department"
      }
    }
  ]
}
```

#### GET `/api/academics/subjects`

List subjects, optionally filtered by department.

**Authorization:** Authenticated

**Query Parameters:**

```
departmentId: number (optional)
```

**Response:**

```json
{
  "subjects": [
    {
      "id": 1,
      "name": "Mathematics",
      "departmentId": 1,
      "maxScore": 100,
      "department": {
        "id": 1,
        "name": "Primary Department"
      }
    }
  ]
}
```

#### GET `/api/academics/terms`

List academic terms.

**Authorization:** Authenticated

**Response:**

```json
{
  "terms": [
    {
      "id": 1,
      "name": "First Term"
    }
  ]
}
```

#### GET `/api/academics/sessions`

List academic sessions.

**Authorization:** Authenticated

**Response:**

```json
{
  "sessions": [
    {
      "id": 1,
      "name": "2024/2025",
      "isActive": true
    }
  ]
}
```

#### GET `/api/academics/students?classId={id}&sessionId={id}`

Get students by class and session.

**Authorization:** Administrator, Teacher

**Query Parameters (required):**

```
classId: number
sessionId: number
```

**Response:**

```json
{
  "students": [
    {
      "id": "student_id",
      "admissionNo": "DPS2024001",
      "firstName": "John",
      "lastName": "Doe",
      "class": { "id": 1, "name": "Primary 1" }
    }
  ]
}
```

#### POST `/api/academics/grades`

Submit grades for students.

**Authorization:** Administrator, Teacher

**Request Body:**

```json
{
  "classId": 1,
  "sessionId": 1,
  "termId": 1,
  "subjectId": 1,
  "grades": [
    {
      "studentId": "student_id",
      "firstScore": 85,
      "secondScore": 90,
      "fourthScore": 88
    }
  ]
}
```

**Response:** `201 Created`

```json
{
  "message": "Grades submitted successfully",
  "count": 25
}
```

### Results

#### GET `/api/results`

Check student results.

**Authorization:** Public (with admission number)

**Query Parameters:**

```
admissionNo: string (required)
termId: number (required)
sessionId: number (required)
```

**Response:**

```json
{
  "student": {
    "admissionNo": "DPS2024001",
    "firstName": "John",
    "lastName": "Doe",
    "class": { "name": "Primary 1" }
  },
  "grades": [
    {
      "subject": { "name": "Mathematics" },
      "firstScore": 85,
      "secondScore": 90,
      "fourthScore": 88,
      "average": 87.67
    }
  ],
  "result": {
    "position": 3,
    "average": 85.5,
    "totalScore": 513,
    "maxScore": 600
  }
}
```

### Notifications

#### GET `/api/notifications`

List notifications.

**Authorization:** Administrator, Teacher

**Query Parameters:**

```
page: number (default: 1)
limit: number (default: 20)
```

**Response:**

```json
{
  "notifications": [
    {
      "id": "notification_id",
      "title": "Parent Meeting",
      "message": "Parent meeting scheduled for...",
      "type": "MEETING",
      "priority": "HIGH",
      "recipientType": "ALL_PARENTS",
      "sentAt": "2024-03-01T10:00:00.000Z",
      "sender": {
        "name": "Principal Name"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### POST `/api/notifications`

Send a notification.

**Authorization:** Administrator, Teacher

**Request Body:**

```json
{
  "title": "Parent Meeting",
  "message": "Dear parents, we would like to...",
  "type": "MEETING",
  "priority": "HIGH",
  "recipientType": "ALL_PARENTS",
  "classId": 1,
  "departmentId": null
}
```

**Response:** `201 Created`

```json
{
  "id": "notification_id",
  "title": "Parent Meeting",
  "sentAt": "2024-03-01T10:00:00.000Z"
}
```

### Contact & Applications

#### POST `/api/contact`

Submit a contact form.

**Authorization:** Public

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+234...",
  "subject": "Inquiry",
  "message": "I would like to know..."
}
```

**Response:** `200 OK`

```json
{
  "message": "Thank you for contacting us. We will respond shortly.",
  "id": "contact_id"
}
```

#### POST `/api/apply`

Submit a student application.

**Authorization:** Public

**Request Body:**

```json
{
  "studentFirstName": "John",
  "studentLastName": "Doe",
  "studentDateOfBirth": "2010-01-01",
  "classApplyingFor": "Primary 1",
  "parentName": "Jane Doe",
  "parentEmail": "jane@example.com",
  "parentPhone": "+234..."
}
```

**Response:** `201 Created`

```json
{
  "message": "Application submitted successfully",
  "applicationId": "app_id",
  "referenceNumber": "REF2024001"
}
```

#### POST `/api/book-visit`

Book a school visit.

**Authorization:** Public

**Request Body:**

```json
{
  "parentName": "Jane Doe",
  "parentEmail": "jane@example.com",
  "parentPhone": "+234...",
  "preferredDate": "2024-03-15",
  "numberOfChildren": 2,
  "message": "Looking forward to visiting..."
}
```

**Response:** `200 OK`

```json
{
  "message": "Visit booking received successfully",
  "bookingId": "visit_id"
}
```

## Webhooks

**Status**: Not yet implemented

Planned webhooks for:
- Notification delivery status
- Sanity CMS content updates
- Payment processing (future)

## SDK / Client Libraries

**Status**: Not available

Future plans for:
- JavaScript/TypeScript SDK
- Python SDK
- Mobile SDKs (iOS/Android)

## Versioning

Current version: `v1` (implicit)

API versioning strategy:
- Breaking changes will be introduced in new versions (`/api/v2/...`)
- Current API will be maintained for at least 12 months after new version release
- Deprecation warnings will be added 6 months before removal

## Support

For API questions or issues:
- Email: api@dprideschools.com
- GitHub Issues: https://github.com/DSNOUSE/dprideinternationalschool/issues
- Documentation: https://docs.dprideschools.com (coming soon)

---

Last updated: March 2, 2026
