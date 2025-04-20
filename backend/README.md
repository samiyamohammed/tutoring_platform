# Tutoring_platform Backend Server

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)
![JWT](https://img.shields.io/badge/JWT-Auth-blue)

The backend server for TutorConnect, a platform connecting tutors and students. Built with Node.js, Express, and MongoDB.

## Table of Contents


- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Development](#development)


## Features

- **User Authentication**: JWT-based auth system  
- **Course Management**: Create, read, update courses  
- **Session Scheduling**: Manage tutoring sessions  
- **Real-time Chat**: WebSocket implementation  
- **Enrollment System**: Student enrollment tracking  
- **RESTful API**: Standardized endpoints  

## Tech Stack

**Server:**  
![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white)  
![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white)

**Database:**  
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white)

**Authentication:**  
![JWT](https://img.shields.io/badge/-JWT-000000?logo=json-web-tokens&logoColor=white)

**Real-time:**  
![Socket.io](https://img.shields.io/badge/-Socket.io-010101?logo=socket.io&logoColor=white)

## Installation

1. Install dependencies of not installed:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication

| Endpoint           | Method | Description       |
|--------------------|--------|-------------------|
| `/api/auth/register` | POST   | Register new user |
| `/api/auth/login`    | POST   | User login        |



### Courses

| Endpoint                         | Method | Description           |
|----------------------------------|--------|-----------------------|
| `/api/course`                    | GET    | Get all courses       |
| `/api/course`                    | POST   | Create new course     |
| `/api/course/:id`                | GET    | Get course details    |


### Sessions

| Endpoint             | Method | Description         |
|----------------------|--------|---------------------|
| `/api/session`       | GET    | Get all sessions    |
| `/api/session`       | POST   | Create session      |
| `/api/session/:id`   | GET    | Get session details |

## Sample Requests

### Login Request

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"yourpassword"}'
```

### Get Courses Request

```bash
curl -X GET http://localhost:5000/api/course \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Environment Variables

Create a `.env` file in the root directory and add the following:

```env
MONGODB_URI=the_actual_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

## Development

To run the server in development mode with auto-reloading:

```bash
npm run dev
```


