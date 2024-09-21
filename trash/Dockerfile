# Use a lightweight base image
FROM ubuntu:20.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    supervisor

# Download and set up Weaviate
RUN curl -L https://cr.weaviate.io/semitechnologies/weaviate:1.26.4 -o /usr/local/bin/weaviate && \
    chmod +x /usr/local/bin/weaviate

# Download and set up img2vec-pytorch
RUN curl -L https://cr.weaviate.io/semitechnologies/img2vec-pytorch:resnet50 -o /usr/local/bin/img2vec-pytorch && \
    chmod +x /usr/local/bin/img2vec-pytorch

# Create a directory for Weaviate data
RUN mkdir -p /var/lib/weaviate

# Copy the supervisor configuration file
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose necessary ports
EXPOSE 8080 50051

# Command to run supervisord
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
