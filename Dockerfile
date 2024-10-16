# Stage 1: Build React frontend
FROM node:16-alpine as frontend-builder
WORKDIR /usr/src/app
COPY dinoapp/package.json dinoapp/package-lock.json ./
RUN npm install
COPY dinoapp/ .
RUN npm run build

# Stage 2: Build Django backend
FROM python:3.12
WORKDIR /usr/src/app
COPY dino/ .
COPY --from=frontend-builder /usr/src/app/build /usr/src/app/static
RUN pip install -r requirements.txt
RUN pip install python-dotenv

# Expose the necessary port
EXPOSE 8000
ENV PYTHONUNBUFFERED=1

# Start the Django server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
