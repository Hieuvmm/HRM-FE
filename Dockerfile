FROM node:18-alpine

WORKDIR /app/WAREHOUSE/ui

COPY package*.json ./

RUN npm install --force

COPY . .

# Nhận biến NODE_ENV từ build argument
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Chạy build với biến môi trường đã đặt
RUN npm run build:${NODE_ENV}

RUN npm install -g serve

ENTRYPOINT ["npx", "serve", "-s", "dist", "-l", "3000"]


