# Creative Manager

Creative Manager is a full-stack web application developed to manage and organize creative content efficiently. The application provides a simple interface for creating, viewing, updating, and managing creative records.

## Tech Stack

- Frontend: React.js
- Backend: Node.js
- API: Express.js
- Database: MongoDB
- Development Environment: Vite
- Database Management: MongoDB Compass / MongoDB Shell

## Project Features

- Create creative content
- View existing creative records
- Update creative content
- Delete creative records
- Manage content status
- Search and filter creative records
- Responsive and user-friendly interface
- REST API based backend
- MongoDB database integration



## Requirements

Before running the project, make sure the following are installed:

- Node.js
- npm
- MongoDB

## Database Setup

This project uses MongoDB as the database.

Create a MongoDB database and configure the MongoDB connection string in the backend `.env` file.

Example:

MONGO_URI=mongodb://127.0.0.1:27017/creative_manager

PORT=5000

The required collections will be created automatically when the application is used.

## Installation

### Step 1: Install Backend Dependencies

Open a terminal inside the `server` folder and run:

npm install

### Step 2: Install Frontend Dependencies

Open another terminal inside the `client` folder and run:

npm install

### Step 3: Configure Environment Variables

Inside the `server` folder, create a `.env` file and add:

MONGO_URI=mongodb://127.0.0.1:27017/creative_manager

PORT=5000

If a different MongoDB connection string or port is required, update these values accordingly.

## Running the Project

### Start Backend

Open the terminal in the `server` folder:

npm start

The backend will run on:

http://localhost:5000

### Start Frontend

Open another terminal in the `client` folder:

npm run dev

The frontend will run on the Vite development URL shown in the terminal.

## Database Information

The application stores its data in MongoDB.

The database contains the information required by the Creative Manager application, such as creative records, content details, status, and timestamps.

## API

The backend provides REST APIs for managing creative content.

Typical operations include:

GET - Fetch creative records

POST - Create a new creative record

PUT - Update an existing creative record

DELETE - Delete a creative record

## Important Notes

- Make sure MongoDB is running before starting the backend.
- Make sure the MongoDB connection string in `.env` is correct.
- Install dependencies using `npm install` before running the application.
- The `.env` file is not included in the ZIP if it contains local or sensitive configuration.
- If required, create the `.env` file using the configuration mentioned above.

## How to Test

1. Start MongoDB.
2. Start the backend server.
3. Start the frontend application.
4. Open the frontend URL provided by Vite.
5. Use the application to create, view, update, and delete creative records.
6. Verify the stored data in MongoDB.



Harsh Shukla

