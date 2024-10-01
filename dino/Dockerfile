# Dockerfile for Django Backend
FROM python:3.12

# Set the working directory
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install python dependencies
RUN pip install -r requirements.txt

# Install python-dotenv for environment variable management
RUN pip install python-dotenv

# Expose the necessary port
EXPOSE 8000

# Set the environment variable
ENV PYTHONUNBUFFERED=1

# Command to run the Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
