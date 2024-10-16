# Stage 1: Build React frontend
FROM node:16-alpine as frontend-builder
WORKDIR /usr/src/app
COPY dinoapp/package.json dinoapp/package-lock.json ./
RUN npm install
COPY dinoapp/ .
RUN npm run build

# Stage 2: Build Django backend
FROM python:3.12 as django-backend
WORKDIR /usr/src/app
COPY manage.py .
COPY dino/ dino/
COPY reactapi/ reactapi/
COPY --from=frontend-builder /usr/src/app/build /usr/src/app/static
RUN pip install -r dino/requirements.txt
RUN pip install python-dotenv
RUN python manage.py collectstatic --noinput

# Stage 3: Nginx to serve static files
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=django-backend /usr/src/app/static /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
