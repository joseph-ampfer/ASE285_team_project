# Canvas LMS Integration Guide

## Overview

This document explains how to integrate your Todo app with Canvas LMS to pull assignments and due dates.

## Step 1: Get Canvas API Access

### Option A: Personal Access Token (for development)

1. Log in to your Canvas instance (e.g., `nku.instructure.com`)
2. Go to **Account** → **Settings**
3. Scroll to **Approved Integrations**
4. Click **+ New Access Token**
5. Give it a purpose (e.g., "Todo App Development")
6. Copy the token - you'll only see it once!

### Option B: OAuth2 (for production)

For a production app, you'll need to register as a Developer Key:

1. Contact your Canvas admin to register a Developer Key
2. You'll receive a `client_id` and `client_secret`
3. Implement OAuth2 flow in your app

## Step 2: Canvas API Endpoints

### Base URL
```
https://YOUR_INSTITUTION.instructure.com/api/v1
```

For NKU: `https://nku.instructure.com/api/v1`

### Useful Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/courses` | GET | List all your courses |
| `/courses/:id/assignments` | GET | Get assignments for a course |
| `/users/self` | GET | Get current user info |
| `/users/self/todo` | GET | Get user's todo items from Canvas |

### Example: Get Assignments

```javascript
// Using fetch with Personal Access Token
const CANVAS_TOKEN = 'your_token_here';
const CANVAS_BASE = 'https://nku.instructure.com/api/v1';

async function getAssignments(courseId) {
  const response = await fetch(
    `${CANVAS_BASE}/courses/${courseId}/assignments`,
    {
      headers: {
        'Authorization': `Bearer ${CANVAS_TOKEN}`
      }
    }
  );
  return response.json();
}
```

### Example Response: Assignment Object

```json
{
  "id": 12345,
  "name": "Week 5 Assignment",
  "description": "<p>Complete the following...</p>",
  "due_at": "2024-02-15T23:59:59Z",
  "points_possible": 100,
  "course_id": 67890,
  "html_url": "https://nku.instructure.com/courses/67890/assignments/12345"
}
```

## Step 3: Mapping Canvas to Todos

When you pull assignments from Canvas, map them to your todo format:

```javascript
function canvasToTodo(assignment) {
  return {
    title: assignment.name,
    date: assignment.due_at ? assignment.due_at.split('T')[0] : 'No due date',
    source: 'canvas',
    canvasId: assignment.id,
    courseId: assignment.course_id
  };
}
```

## Step 4: Environment Variables

Store your Canvas credentials securely:

### Backend `.env`
```env
CANVAS_API_TOKEN=your_personal_access_token
CANVAS_BASE_URL=https://nku.instructure.com/api/v1
```

### Frontend `.env.local`
```env
VITE_CANVAS_BASE_URL=https://nku.instructure.com/api/v1
```

**⚠️ NEVER put API tokens in frontend code!**

## Architecture Options

### Option 1: Backend Proxy (Recommended)

```
React → Your Backend → Canvas API
```

Your backend keeps the Canvas token secure and proxies requests.

### Option 2: Direct from Frontend (OAuth only)

```
React → Canvas API (with user's OAuth token)
```

Only works with OAuth2 where users authenticate themselves.

## CORS Considerations

Canvas API doesn't allow direct browser requests (CORS). You MUST:
- Either proxy through your backend
- Or use OAuth2 with user authentication

## Next Steps

1. Get a Personal Access Token for development
2. Test the Canvas API with Postman or curl
3. Add Canvas routes to your backend
4. Create a Canvas sync feature in your React app

## Resources

- [Canvas LMS REST API Documentation](https://canvas.instructure.com/doc/api/)
- [Canvas API Authentication](https://canvas.instructure.com/doc/api/file.oauth.html)
- [Assignments API](https://canvas.instructure.com/doc/api/assignments.html)

