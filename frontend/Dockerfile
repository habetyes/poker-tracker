# ========== Stage 1: Build the React app ==========
FROM node:16 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . . 
RUN npm run build

# ========== Stage 2: Serve with Nginx ==========
FROM nginx:alpine

# (Optional) Install envsubst if not included in the base image
# Usually nginx:alpine already has it, but if not:
# RUN apk add --no-cache gettext

# Copy our Nginx config template & entrypoint
COPY default.conf.template /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy the built React files from stage 1
COPY --from=build /app/build /usr/share/nginx/html

# Listen on port 80
EXPOSE 80

# Use our custom entrypoint script that replaces $BACKEND_HOST
ENTRYPOINT ["/docker-entrypoint.sh"]
