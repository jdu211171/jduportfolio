#!/bin/bash

# Exit on any error
set -e

# Source environment variables
source .env

# Function to display status messages
echo_status() {
    echo "➡️ $1..."
}

echo_success() {
    echo "✅ $1"
}

# Change to the portfolio-client directory
echo_status "Changing to portfolio-client directory"
cd /home/user/Development/jduportfolio/portfolio-client
echo_success "Changed directory successfully"

# Install dependencies
echo_status "Installing npm dependencies"
npm install
echo_success "Dependencies installed"

# Build the project
echo_status "Building the project"
npm run build
echo_success "Build completed"

# Create zip file
echo_status "Creating zip file of dist directory"
zip -r dist.zip dist
echo_success "Zip file created"

# Copy to EC2
echo_status "Copying dist.zip to EC2 instance"
scp -i "$EC2_KEY" dist.zip "$EC2_USER@$EC2_HOST:$EC2_PATH/"
echo_success "File transfer completed"

# Deploy on EC2
echo_status "Deploying on EC2"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "cd $EC2_PATH && unzip -o dist.zip && pm2 restart $PM2_SERVICE_NAME"
echo_success "Deployment completed"

# Clean up
echo_status "Cleaning up local zip file"
rm dist.zip
echo_success "Clean up completed"

echo "🎉 Deployment completed successfully!"
