FROM node:20.11.1 as builder

# Set the working directory to /app inside the container

WORKDIR /app
# Copy app files

COPY . .

RUN npm install --silent

#RUN npm ci

# Build the app
RUN npm run build --silent

# ==== RUN =======
# Set the env to "production"
# ENV NODE_ENV production

# Expose the port on which the app will be running (3000 is the default that `serve` uses)
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]


# Bundle static assets with nginx
#FROM nginx:1.21.0-alpine as production
#ENV NODE_ENV production
# Copy built assets from `builder` image

#COPY --from=builder /app/.next /usr/share/nginx/html/_next
# Add your nginx.conf
#COPY .nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
#EXPOSE 80
# Start nginx
#CMD ["nginx", "-g", "daemon off;"]
