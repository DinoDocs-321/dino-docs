FROM node:16-alpine as frontend-builder
WORKDIR /usr/src/app
COPY dinoapp/package.json dinoapp/package-lock.json ./
RUN npm install
COPY dinoapp/ .
RUN npm run build

FROM python:3.12
WORKDIR /usr/src/app
COPY manage.py .
COPY dino/ dino/
COPY reactapi/ reactapi/
COPY --from=frontend-builder /usr/src/app/build /usr/src/app/static
RUN pip install -r dino/requirements.txt
RUN pip install python-dotenv

EXPOSE 8000
ENV PYTHONUNBUFFERED=1

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
