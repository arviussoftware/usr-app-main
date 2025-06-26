# Stage 1: Build the React app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps --quiet
COPY . .
RUN npm run build

# Stage 2: Serve the app
FROM node:18-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/build ./build
ENV PORT=8080
EXPOSE ${PORT}
CMD ["sh", "-c", "serve -s build -l tcp://0.0.0.0:${PORT}"]
