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

# Function to validate environment variables
validate_env_vars() {
    echo_status "Validating environment variables"
    
    # Check if environment variables are set
    [[ -z "$EC2_KEY" ]] && echo_error "EC2_KEY is not set"
    [[ -z "$EC2_USER" ]] && echo_error "EC2_USER is not set"
    [[ -z "$EC2_HOST" ]] && echo_error "EC2_HOST is not set"
    [[ -z "$EC2_PATH" ]] && echo_error "EC2_PATH is not set"
    
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

# Function to display status messages
echo_status() {
    echo "➡️ $1..."
}

echo_success() {
    echo "✅ $1"
}

# Validate environment variables
validate_env_vars

# Test SSH connection
test_ssh_connection

# Determine project paths
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Install dependencies at repository root so workspace devDependencies are available
echo_status "Installing npm dependencies"
if ! (cd "$ROOT_DIR" && NPM_CONFIG_PRODUCTION=false npm install --include=dev); then
    echo_error "Failed to install dependencies"
fi
echo_success "Dependencies installed"

# Change to the script's directory
echo_status "Changing to the script's directory"
if ! cd "$SCRIPT_DIR"; then
    echo_error "Failed to change directory to script location"
fi
echo_success "Changed directory successfully"

# Build the project
echo_status "Building the project"
if ! npm run build; then
    echo_error "Failed to build the project"
fi
echo_success "Build completed"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo_error "dist directory not found after build"
fi

# Create zip file
echo_status "Creating zip file of dist directory"
if ! zip -r dist.zip dist; then
    echo_error "Failed to create zip file"
fi

# Verify zip file was created
if [ ! -f "dist.zip" ]; then
    echo_error "dist.zip file not found after zip command"
fi
echo_success "Zip file created"

# Clean up old files on EC2 first
echo_status "Cleaning up old files on EC2"
if ! ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "cd $EC2_PATH && \
    echo 'Removing old dist.zip file...' && \
    [ -f dist.zip ] && rm -f dist.zip || echo 'No existing dist.zip to remove' && \
    echo 'Removing old dist directory...' && \
    [ -d dist ] && rm -rf dist || echo 'No existing dist directory to remove'"; then
    echo_error "Failed to clean up old files on EC2"
fi
echo_success "EC2 cleanup completed"

# Copy to EC2
echo_status "Copying dist.zip to EC2 instance"
if ! scp -i "$EC2_KEY" dist.zip "$EC2_USER@$EC2_HOST:$EC2_PATH/"; then
    echo_error "Failed to copy dist.zip to EC2 instance"
fi
echo_success "File transfer completed"

# Add a delay to ensure file system consistency
sleep 3

# Verify dist.zip exists on EC2 with detailed information
echo_status "Verifying dist.zip on EC2"
if ! ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "cd $EC2_PATH && \
    if [ ! -f dist.zip ]; then \
        echo 'ERROR: dist.zip file not found'; \
        ls -la .; \
        exit 1; \
    fi && \
    echo 'File details:' && \
    ls -la dist.zip && \
    echo 'File size:' && \
    du -h dist.zip && \
    echo 'Directory contents:' && \
    ls -la"; then
    echo_error "dist.zip not found or verification failed on EC2 after transfer"
fi
echo_success "File verification completed"

# Deploy on EC2
echo_status "Deploying on EC2"
DEPLOY_COMMANDS="cd $EC2_PATH && \
  echo 'Current directory:' && pwd && \
  echo 'Directory contents:' && ls -la && \
  echo 'Unzipping dist.zip...' && \
  [ -f dist.zip ] || { echo 'ERROR: dist.zip not found before unzip'; exit 1; } && \
  unzip -o dist.zip || { echo 'ERROR: unzip command failed'; ls -la; exit 1; } && \
  echo 'Directory contents after unzip:' && ls -la && \
  if [ ! -d 'dist' ]; then echo 'ERROR: dist directory not created after unzip'; exit 1; fi && \
  echo 'Verifying dist directory contents:' && ls -la dist && \
  echo 'Frontend deployment complete - static files ready to be served by nginx'"

if ! ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "$DEPLOY_COMMANDS"; then
    echo_error "Deployment on EC2 failed"
fi
echo_success "Deployment completed"

# Clean up
echo_status "Cleaning up local zip file"
if [ -f "dist.zip" ]; then
    if ! rm dist.zip; then
        echo_error "Failed to remove local dist.zip file"
    fi
else
    echo "dist.zip not found locally, skipping cleanup"
fi

# Check the status of the deployment
echo_status "Checking deployment status"
if ! ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "cd $EC2_PATH && \
    [ -d dist ] && echo 'dist directory exists' && \
    echo 'Frontend static files deployed successfully'"; then
    echo_error "Deployment status check failed"
fi
echo_success "Deployment status verified"

echo "🎉 Deployment completed successfully!"
