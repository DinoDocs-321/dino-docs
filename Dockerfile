#Dockerfile PR test
FROM python:3.12-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy the current directory contents into the container at /usr/src/app
COPY . .

# Install python dependencies
RUN pip install -r requirements.txt

# Install npm and dependencies
RUN apt-get update && apt-get install -y npm && \
    cd dinoreact && npm install && npm install bson

# Install supervisord
RUN apt-get update && apt-get install -y supervisor

# Expose the necessary ports
EXPOSE 8000
EXPOSE 3000

# Create supervisord configuration file
RUN echo "[supervisord]\nnodaemon=true\n" > /etc/supervisor/supervisord.conf && \
    echo "[program:django]\ncommand=python manage.py runserver 0.0.0.0:8000\ndirectory=/usr/src/app\nautostart=true\nautorestart=true\n" >> /etc/supervisor/supervisord.conf && \
    echo "[program:npm]\ncommand=npm start\ndirectory=/usr/src/app/dinoreact\nautostart=true\nautorestart=true\n" >> /etc/supervisor/supervisord.conf

# Set the environment variable
ENV PYTHONUNBUFFERED=1

# Command to run the supervisor
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
