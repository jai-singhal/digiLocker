# Use the official Python base image
FROM python:3.9-slim

# Set the arguments
ARG APP_SECRETKEY
ARG DROPBOX_KEY
ARG DROPBOX_SECRET
ARG DROPBOX_ACCESS_TYPE
ARG DROPBOX_ACCESS_TOKEN
ARG MAIL_USERNAME
ARG MAIL_PASSWORD
ARG MAIL_DEFAULT_SENDER
ARG MAIL_SENDER
ARG SECRET_KEY
ARG SERVER_BASE_ADDRESS
ARG DAPR_PORT
ARG DAPR_GRPC_PORT
ARG DAPR_HTTP_PORT
ARG DAPR_APP_POR

# Set the environment variables
ENV APP_SECRETKEY=$APP_SECRETKEY
ENV DROPBOX_KEY=$DROPBOX_KEY
ENV DROPBOX_SECRET=$DROPBOX_SECRET
ENV DROPBOX_ACCESS_TYPE=$DROPBOX_ACCESS_TYPE
ENV DROPBOX_ACCESS_TOKEN=$DROPBOX_ACCESS_TOKEN
ENV MAIL_USERNAME=$MAIL_USERNAME
ENV MAIL_PASSWORD=$MAIL_PASSWORD
ENV MAIL_DEFAULT_SENDER=$MAIL_DEFAULT_SENDER
ENV MAIL_SENDER=$MAIL_SENDER
ENV SECRET_KEY=$SECRET_KEY
ENV SERVER_BASE_ADDRESS=$SERVER_BASE_ADDRESS
ENV DAPR_PORT=3500
ENV DAPR_GRPC_PORT=50001
ENV DAPR_HTTP_PORT=3501
ENV DAPR_APP_PORT=5000

# Install Dapr CLI
RUN wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Create a directory for your app and set it as the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose the ports your app runs on
EXPOSE $DAPR_APP_PORT

# Run app.py when the container launches
#CMD ["gunicorn", "-w 2", "-b", "0.0.0.0:8000", "-t 120", "main:app"]

# Start Dapr sidecar and then your Flask app
CMD ["dapr", "run", "--app-id", "digiLocker", "--app-port", "5000", "python", "main.py"]