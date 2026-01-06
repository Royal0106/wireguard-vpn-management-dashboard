# WireGuard VPN Management Dashboard

## Overview
A web-based management dashboard for administering a WireGuard VPN server with Proton VPN integration. The application provides secure administration of VPN peers, monitoring capabilities, and automated routing through Proton VPN endpoints.

## Authentication
- Admin authentication required using Internet Identity
- All administrative functions protected behind authentication

## Core Features

### WireGuard Server Management
- Install and configure WireGuard VPN server on the host machine
- Start, stop, and restart VPN service operations
- Display current service status and health metrics

### Peer Management
- View list of all configured WireGuard peers (clients)
- Add new peers with automatic key generation
- Remove existing peers
- Generate client configuration files for download
- Generate QR codes for mobile client setup
- Display peer connection status and last seen information

### Proton VPN Integration
- Connect to Proton VPN API using user-provided Pro credentials
- Fetch available WireGuard-capable Proton VPN servers
- Filter and select low-load 10 Gbps servers near Raleigh, NC
- Establish tunnel connections through selected Proton endpoints
- Route outbound traffic through the Proton VPN tunnel

### Monitoring Dashboard
- Real-time display of active peer connections
- Data usage statistics per peer and total
- Connection logs and activity history
- Server load and performance metrics
- Network speed measurements
- Tunnel health status with Proton VPN endpoint
- Connection quality indicators

## Deployment Guide

### Remote Server Deployment Instructions
- Display comprehensive deployment guide with step-by-step instructions for Ubuntu 26.04 servers
- Include SCP command examples for transferring project files from local `~/vpn-dashboard/` to remote `/home/ubuntu/vpn-dashboard/`
- Provide SSH connection examples with placeholder for user's VPS IP address
- Show commands for navigating to project directory on remote server
- Include dependency installation commands (dfx, Docker, WireGuard)
- Provide dfx deploy command with proper configuration
- Include post-deployment configuration steps for Proton VPN Pro credentials
- Display troubleshooting tips and common deployment issues
- Show verification commands to confirm successful deployment

### Freelancer Deployment Guide
- Generate a comprehensive plain-text deployment guide specifically formatted for freelancers
- Include overview of application purpose: managing dedicated WireGuard VPN host with Proton VPN Pro integration
- List prerequisites: Ubuntu 26.04 server, SSH access, Internet connectivity
- Provide system preparation commands for updates and essential package installations
- Detail steps for uploading the v5 app ZIP file via SCP with specific file paths
- Include deployment instructions with dfx deploy commands, folder paths, and environment setup
- Explain Proton VPN configuration process and WireGuard management instructions
- Provide clear instructions for inputting credentials and selecting low-load 10 Gbps servers
- Include verification steps and troubleshooting section
- Format as neat readable sections suitable for .txt files or email copy-paste
- Make the guide self-contained and easy to follow for technical freelancers

### Freelancer Deployment Checklist
- Interactive checklist interface within the Freelancer Guide section
- Server Preparation section with step-by-step SSH login instructions for Ubuntu 26.04
- System update commands and dependency installation checklist (curl, git, docker.io, wireguard, dfx)
- Docker service enablement and PATH export instructions
- App Deployment section with SCP upload commands and file extraction steps
- dfx deploy execution instructions with Internet Identity login requirements
- WireGuard Configuration Generation section explaining Peers tab usage
- Instructions for creating new server/client pairs through the dashboard
- Export procedures for .conf files and QR codes for client distribution
- File storage locations and client delivery packaging instructions
- Proton VPN Pro Integration section with Settings tab credential entry
- Server selection instructions for low-load 10 Gbps servers near Raleigh, NC
- Verification & Monitoring section with Overview tab health checks
- Service restart and troubleshooting procedures
- Firewall ports, DNS configuration, and key regeneration troubleshooting notes
- Interactive checkboxes for tracking completion of each step

### Final Deployment Guide Document Generator
- Generate a comprehensive final deployment document for freelancers in plain-text format
- Include complete installation and setup instructions for Ubuntu 26.04 with all package installations
- Provide detailed Docker and dfx installation steps with proper PATH configuration
- Include WireGuard configuration and setup instructions
- Detail SSH and SCP commands for uploading app files from local machine to remote server
- Provide step-by-step instructions for extracting and deploying the project via dfx deploy
- Include comprehensive Proton VPN Pro configuration instructions with credentials entry and server selection
- Provide post-deployment verification checklist covering WireGuard tunnel status, dashboard access, and Proton connection verification
- Format document as plain-text with clear sections and copy/download functionality
- Ensure document is self-contained and complete for freelancer deployment

### Ubuntu 26.04 Installation Script
- Automated installation script (`install_vpn_dashboard.sh`) for Ubuntu 26.04 deployment
- System package updates and upgrades
- Installation of required dependencies: curl, git, build-essential, docker.io, wireguard, unzip
- dfx (Internet Computer SDK) installation using official installer with PATH configuration
- Docker service enablement and startup
- Creation of deployment directory at `/opt/vpn-dashboard`
- Project ZIP extraction handling with fallback prompts for manual upload
- Automatic dfx deploy execution from extracted application directory
- Success message display with next steps for dashboard login and Proton VPN Pro credential configuration
- Error handling and validation throughout installation process

### Ubuntu 26.04 Deployment Script
- Automated system update and upgrade process
- Installation of base dependencies: curl, git, build-essential
- dfx (Internet Computer SDK) installation using official install script with PATH configuration
- Docker installation via apt (docker.io package) with service enablement
- WireGuard installation with kernel module loading and boot enablement
- Project deployment through dfx deploy command
- Systemd service creation for auto-start on boot (/etc/systemd/system/wireguard-dashboard.service)
- Graceful reboot handling and service persistence
- Clear step-by-step progress messaging throughout deployment

## Backend Data Storage
- WireGuard server configuration and keys
- Peer configurations and public keys
- Proton VPN credentials (encrypted)
- Connection logs and usage statistics
- Server performance metrics history
- Deployment configuration and system state
- Installation script content and configuration
- Freelancer deployment guide content and formatting
- Final deployment document content and generation templates
- Freelancer deployment checklist items and completion tracking

## Backend Operations
- WireGuard service control (start/stop/restart)
- Peer key generation and management
- Proton VPN API communication
- Real-time metrics collection
- Configuration file generation
- System monitoring and health checks
- Deployment script execution and system setup
- Service management and auto-start configuration
- Installation script generation and delivery
- Freelancer deployment guide generation and plain-text formatting
- Final deployment document generation with complete instructions and verification steps
- Freelancer deployment checklist management and progress tracking

## Security Requirements
- All private keys and sensitive configurations stored securely
- Proton VPN credentials encrypted at rest
- Secure communication between dashboard and backend
- Admin session management with Internet Identity
- Secure deployment process with proper service isolation
