# Use nginx as the image base
FROM nginx:alpine

# Copy files to default HTML directory
COPY . /usr/share/nginx/html

# Expose port 80 to the network
EXPOSE 80