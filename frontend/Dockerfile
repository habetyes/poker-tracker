# Build stage
FROM node:16 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
# Copy our custom Nginx configuration file
COPY default.conf /etc/nginx/conf.d/default.conf
# Copy the React build output to Nginx's serving directory
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
