#!/bin/bash

# Check if argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <workspace_name>"
  exit 1
fi

# Change directory to Terraform directory
cd /root/haproxy/terraform || exit 1

# Initialize Terraform
terraform init || exit 1

# Select workspace
terraform workspace select "$1" || exit 1

