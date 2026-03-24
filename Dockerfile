# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 2000

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "2000"]
