# API Documentation

## Swagger UI

Access the interactive API documentation at:
```
http://localhost:3000/api/v1/docs
```

## OpenAPI Spec

The OpenAPI 3.0 specification is located at `openapi.yaml` in the project root.

## Example Requests

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Task
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project",
    "description": "Finish backend implementation",
    "status": "active"
  }'
```

### List Tasks
```bash
curl "http://localhost:3000/api/v1/tasks?page=1&limit=10&status=active" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Task
```bash
curl http://localhost:3000/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Task
```bash
curl -X PATCH http://localhost:3000/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }'
```

### Delete Task
```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Response Format

All endpoints return JSON in the following format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "details": { ... }
  }
}
```
