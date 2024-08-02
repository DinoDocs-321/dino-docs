
# Dino Docs Project

This documentation provides instructions to set up and run the Dino Docs project. Follow the steps below to get started.

## Prerequisites

Ensure you have the following installed:
- Python 3.12
- Node.js
- npm
- Docker (for Docker setup)

## Virtual Environment Setup

### Step 1: Create a Virtual Environment

Navigate to the project directory and create a virtual environment:

`
python -m venv venv
`

Activate the virtual environment:

- On Windows:
  `
  venv\Scripts\activate
  `
- On macOS/Linux:
  `
  source venv/bin/activate
  `

### Step 2: Install Dependencies

Install the required Python packages from \`requirements.txt\`:

`
pip install -r requirements.txt
`

### Step 3: Run Django Migrations

Apply the database migrations:

`python manage.py makemigrations`

`python manage.py migrate`

### Step 4: Run the Django Server

Start the Django development server:

`
python manage.py runserver
`

### Step 5: Set Up React Frontend

Navigate to the \`dinoreact\` folder and install the necessary Node.js packages:

`
cd dinoreact
npm install
npm install bson
npm start
`

### Step 6: Access the Application

Open your web browser and go to `http://localhost:3000` (or the port specified by the React app).

## Docker Setup

### Step 1: Build Docker Container

Build the Docker container using Docker Compose:

`
docker-compose build
`

### Step 2: Run Docker Container

Run the Docker container:

`
docker-compose up
`

## Accessing the Application

After setting up either with a virtual environment or Docker, you can access the application at `http://localhost:3000` (or the port specified by the React app).

## File Structure

- `dino/`: Django project directory
- `dinoapp/`: Main Django application
- `dinoreact/`: React frontend application
- `requirements.txt`: Python dependencies
- `docker-compose.yml`: Docker Compose configuration
- `Dockerfile`: Docker configuration for the Django application

## Additional Notes

- Ensure that ports used in the Django and React applications are not occupied by other services.
- For any issues or further customization, refer to the respective configuration files (\`settings.py\`, \`package.json\`, etc.).
