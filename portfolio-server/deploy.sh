#!/bin/bash

# Exit on any error
set -e

# Source environment variables
source .env

# Function to display error messages and exit
echo_error() {
    echo "❌ ERROR: $1"
    exit 1
}

# Function to display status messages
echo_status() {
    echo "➡️ $1..."
}

echo_success() {
    echo "✅ $1"
}

# Function to validate environment variables
validate_env_vars() {
    echo_status "Validating environment variables"
    
    # Check if environment variables are set
    [[ -z "$EC2_KEY" ]] && echo_error "EC2_KEY is not set"
    [[ -z "$EC2_USER" ]] && echo_error "EC2_USER is not set"
    [[ -z "$EC2_HOST" ]] && echo_error "EC2_HOST is not set"
    [[ -z "$EC2_PATH" ]] && echo_error "EC2_PATH is not set"
    [[ -z "$PM2_SERVICE_NAME" ]] && echo_error "PM2_SERVICE_NAME is not set"
    
    # Check if key file exists and has correct permissions
    if [[ ! -f "$EC2_KEY" ]]; then
        echo_error "SSH key file ($EC2_KEY) does not exist"
    fi
    
    # Check key file permissions
    if [[ "$(uname)" == "Darwin" ]]; then
        # macOS
        KEY_PERMS=$(stat -f "%Lp" "$EC2_KEY")
    else
        # Linux
        KEY_PERMS=$(stat -c "%a" "$EC2_KEY")
    fi
    if [[ "$KEY_PERMS" != "400" && "$KEY_PERMS" != "600" ]]; then
        echo_error "SSH key file has incorrect permissions: $KEY_PERMS (should be 400 or 600)"
    fi
    
    echo_success "Environment variables validated"
}

# Test SSH connection before deployment
test_ssh_connection() {
    echo_status "Testing SSH connection"
    if ! ssh -i "$EC2_KEY" -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$EC2_USER@$EC2_HOST" "echo 2>&1"; then
        echo_error "Cannot establish SSH connection to $EC2_USER@$EC2_HOST"
    fi
    echo_success "SSH connection established"
}

# Validate environment variables
validate_env_vars

# Test SSH connection
test_ssh_connection

# Change to the script's directory
echo_status "Changing to the script's directory"
if ! cd "$(dirname "$0")"; then
    echo_error "Failed to change directory to script location"
fi
echo_success "Changed directory successfully"

# Verify package files exist
echo_status "Verifying package files"
if [ ! -f "package.json" ]; then
    echo_error "package.json not found"
fi
echo_success "Package files verified"

# Create deployment package
echo_status "Creating deployment package"
DEPLOY_DIR="deploy_package"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy necessary files and directories
echo_status "Copying application files"
cp -r src "$DEPLOY_DIR/"
cp -r migrations "$DEPLOY_DIR/"
cp -r seeders "$DEPLOY_DIR/"
cp -r config "$DEPLOY_DIR/"
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/" 2>/dev/null || echo "No package-lock.json found, continuing..."
cp ecosystem.config.js "$DEPLOY_DIR/"

echo_success "Application files copied"

# Create zip file
echo_status "Creating deployment zip file"
zip -r deploy.zip "$DEPLOY_DIR"/*
if [ ! -f "deploy.zip" ]; then
    echo_error "Failed to create deployment zip file"
fi
echo_success "Deployment zip file created"

# Check zip file size
ZIP_SIZE=$(du -h deploy.zip | cut -f1)
echo "📦 Zip file size: $ZIP_SIZE"

# Clean up deployment directory
rm -rf "$DEPLOY_DIR"

# Clean up old files on EC2
echo_status "Cleaning up old deployment files on EC2"
if ! ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "cd $EC2_PATH && \
    echo 'Backing up current node_modules...' && \
    [ -d node_modules ] && mv node_modules node_modules.backup || echo 'No existing node_modules to backup' && \
    echo 'Removing old deployment files...' && \
    [ -f deploy.zip ] && rm -f deploy.zip || echo 'No existing deploy.zip to remove'"; then
    echo_error "Failed to clean up old files on EC2"
fi
echo_success "EC2 cleanup completed"

# Transfer deployment package to EC2
echo_status "Transferring deployment package to EC2 (this may take a while)"
if ! scp -i "$EC2_KEY" deploy.zip "$EC2_USER@$EC2_HOST:$EC2_PATH/"; then
    echo_error "Failed to transfer deployment package to EC2"
fi
echo_success "Deployment package transferred"

# Deploy on EC2
echo_status "Deploying on EC2"
DEPLOY_COMMANDS="cd $EC2_PATH && \
  echo 'Current directory:' && pwd && \
  echo 'Stopping PM2 service...' && \
  pm2 stop $PM2_SERVICE_NAME || echo 'Warning: PM2 service was not running' && \
  echo 'Pulling latest code from git...' && \
  git pull origin master || { echo 'ERROR: Failed to pull from git'; exit 1; } && \
  echo 'Extracting deployment package...' && \
  unzip -o deploy.zip || { echo 'ERROR: Failed to extract zip file'; exit 1; } && \
  echo 'Moving files from deploy_package to root...' && \
  cp -rf deploy_package/* . || { echo 'ERROR: Failed to move files from deploy_package'; exit 1; } && \
  echo 'Cleaning up deploy_package directory...' && \
  rm -rf deploy_package || echo 'Warning: Failed to remove deploy_package directory' && \
  echo 'Removing deploy.zip...' && \
  rm -f deploy.zip || echo 'Warning: Failed to remove deploy.zip' && \
  echo 'Installing npm dependencies on server...' && \
  npm install --production || { echo 'ERROR: Failed to install npm dependencies'; exit 1; } && \
  echo 'Removing backup node_modules...' && \
  [ -d node_modules.backup ] && rm -rf node_modules.backup || echo 'No backup to remove' && \
  echo 'Creating logs directory...' && \
  mkdir -p logs && \
  echo 'Running database migrations...' && \
  npm run migrate || echo 'Warning: Migrations failed or no new migrations' && \
  echo 'Starting PM2 service...' && \
  pm2 delete $PM2_SERVICE_NAME 2>/dev/null || echo 'No existing PM2 process to delete' && \
  pm2 start ecosystem.config.js --env ${DEPLOY_ENV:-development} --update-env || { echo 'ERROR: Failed to start PM2 service'; exit 1; } && \
  echo 'Saving PM2 configuration...' && \
  pm2 save || echo 'Warning: Failed to save PM2 configuration' && \
  echo 'Verifying service is running...' && \
  pm2 status $PM2_SERVICE_NAME | grep -q 'online' || { echo 'ERROR: PM2 service is not running'; exit 1; }"

if ! ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "$DEPLOY_COMMANDS"; then
    echo_error "Deployment on EC2 failed"
fi
echo_success "Deployment completed on EC2"

# Clean up local files
echo_status "Cleaning up local deployment files"
if [ -f "deploy.zip" ]; then
    if ! rm deploy.zip; then
        echo_error "Failed to remove local deploy.zip file"
    fi
fi
echo_success "Local cleanup completed"

# Check the status of the deployment
echo_status "Checking deployment status"
if ! ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "cd $EC2_PATH && \
    echo 'Checking PM2 service...' && \
    pm2 status $PM2_SERVICE_NAME && \
    echo 'Checking recent logs...' && \
    pm2 logs $PM2_SERVICE_NAME --lines 5 --nostream"; then
    echo_error "Deployment status check failed"
fi
echo_success "Deployment status verified"

echo "🎉 Backend deployment completed successfully!"
echo "📝 Note: The backend code is updated via git pull, and dependencies are installed on the server"