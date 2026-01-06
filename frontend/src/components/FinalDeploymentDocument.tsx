import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Download, FileText, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useGetFinalDeploymentDocument, useSaveFinalDeploymentDocument } from '../hooks/useQueries';

const DEFAULT_DOCUMENT = `================================================================================
WIREGUARD VPN MANAGEMENT DASHBOARD
COMPLETE DEPLOYMENT GUIDE FOR FREELANCERS
================================================================================

VERSION: v5 - Final Deployment Document
LAST UPDATED: ${new Date().toISOString().split('T')[0]}
TARGET PLATFORM: Ubuntu 26.04 LTS

================================================================================
TABLE OF CONTENTS
================================================================================

1. Introduction and Overview
2. Prerequisites and Requirements
3. System Preparation
4. Package Installation
   4.1 System Updates
   4.2 Essential Packages
   4.3 dfx (Internet Computer SDK)
   4.4 Docker Installation
   4.5 WireGuard Installation
5. File Upload and Transfer
   5.1 SSH Connection
   5.2 SCP File Transfer
   5.3 Verification
6. Application Deployment
   6.1 Project Extraction
   6.2 dfx Deployment
   6.3 Service Configuration
7. Proton VPN Pro Configuration
   7.1 Dashboard Access
   7.2 Credentials Entry
   7.3 Server Selection
8. Post-Deployment Verification
   8.1 WireGuard Tunnel Check
   8.2 Dashboard Access Verification
   8.3 Proton Connection Test
9. Troubleshooting Guide
10. Security Best Practices
11. Maintenance and Updates

================================================================================
1. INTRODUCTION AND OVERVIEW
================================================================================

This document provides complete step-by-step instructions for deploying the
WireGuard VPN Management Dashboard on an Ubuntu 26.04 server. This application
provides:

• Web-based WireGuard VPN server management
• Automated routing through Proton VPN Pro endpoints
• Client peer management with QR code generation
• Real-time monitoring and connection statistics
• Secure admin authentication via Internet Identity

The dashboard runs on the Internet Computer blockchain platform, providing
decentralized and secure hosting for your VPN management interface.

IMPORTANT NOTES:
- This guide assumes a fresh Ubuntu 26.04 LTS installation
- All commands should be run on the server unless specified otherwise
- Replace YOUR_SERVER_IP with your actual server IP address
- A Proton VPN Pro account is required (free accounts do not support WireGuard)

================================================================================
2. PREREQUISITES AND REQUIREMENTS
================================================================================

SERVER REQUIREMENTS:
✓ Ubuntu 26.04 LTS (fresh installation recommended)
✓ Minimum 2GB RAM, 2 CPU cores
✓ At least 10GB free disk space
✓ Public IP address for VPN connectivity
✓ Root or sudo access enabled

ACCESS REQUIREMENTS:
✓ SSH access to the server (username and password or SSH key)
✓ Server IP address
✓ Internet connectivity on both local machine and server
✓ SSH client installed (OpenSSH, PuTTY, etc.)

CREDENTIALS NEEDED:
✓ Server SSH credentials (username/password or SSH key)
✓ Proton VPN Pro account (username and password)
  NOTE: Free Proton VPN accounts do NOT support WireGuard protocol

LOCAL SETUP:
✓ Project files located in ~/vpn-dashboard/ on your local machine
✓ SCP or rsync installed for file transfer
✓ Web browser for accessing the dashboard

================================================================================
3. SYSTEM PREPARATION
================================================================================

STEP 1: Connect to Your Server
-------------------------------
From your local machine, connect via SSH:

    ssh ubuntu@YOUR_SERVER_IP

If using a custom SSH key:

    ssh -i /path/to/your-key.pem ubuntu@YOUR_SERVER_IP

Replace YOUR_SERVER_IP with your actual server IP address.

STEP 2: Verify System Information
----------------------------------
Once connected, verify your Ubuntu version:

    lsb_release -a

Expected output should show Ubuntu 26.04 LTS.

STEP 3: Check Available Disk Space
-----------------------------------
    df -h

Ensure you have at least 10GB free space on the root partition.

STEP 4: Check Internet Connectivity
------------------------------------
    ping -c 4 8.8.8.8

You should see successful ping responses.

================================================================================
4. PACKAGE INSTALLATION
================================================================================

4.1 SYSTEM UPDATES
------------------
Update the package list and upgrade existing packages:

    sudo apt update
    sudo apt upgrade -y

This may take several minutes. Wait for completion before proceeding.

4.2 ESSENTIAL PACKAGES
----------------------
Install required base packages:

    sudo apt install -y curl git build-essential unzip

Verify installations:

    curl --version
    git --version
    gcc --version

4.3 DFX (INTERNET COMPUTER SDK) INSTALLATION
---------------------------------------------
Install dfx using the official installer:

    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

Add dfx to your PATH:

    echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc

Verify dfx installation:

    dfx --version

Expected output: dfx 0.x.x or higher

4.4 DOCKER INSTALLATION
-----------------------
Install Docker from Ubuntu repositories:

    sudo apt install -y docker.io

Enable Docker to start on boot:

    sudo systemctl enable docker
    sudo systemctl start docker

Add your user to the docker group:

    sudo usermod -aG docker $USER

IMPORTANT: Log out and log back in for group changes to take effect:

    exit
    ssh ubuntu@YOUR_SERVER_IP

Verify Docker installation:

    docker --version
    docker ps

Expected: Docker version info and empty container list (no errors)

4.5 WIREGUARD INSTALLATION
---------------------------
Install WireGuard and tools:

    sudo apt install -y wireguard wireguard-tools

Load the WireGuard kernel module:

    sudo modprobe wireguard

Configure WireGuard to load on boot:

    echo "wireguard" | sudo tee -a /etc/modules

Verify WireGuard installation:

    sudo wg --version
    lsmod | grep wireguard

Expected: Version info and kernel module loaded

================================================================================
5. FILE UPLOAD AND TRANSFER
================================================================================

5.1 SSH CONNECTION VERIFICATION
--------------------------------
Ensure you can connect to your server from your local machine:

    ssh ubuntu@YOUR_SERVER_IP

5.2 SCP FILE TRANSFER (FROM LOCAL MACHINE)
-------------------------------------------
Open a NEW terminal on your LOCAL machine (not the server).

Navigate to your project directory:

    cd ~

Transfer the project files using SCP:

    scp -r ~/vpn-dashboard/ ubuntu@YOUR_SERVER_IP:/home/ubuntu/

If using a custom SSH key:

    scp -i /path/to/your-key.pem -r ~/vpn-dashboard/ ubuntu@YOUR_SERVER_IP:/home/ubuntu/

ALTERNATIVE: Using rsync (faster for large files):

    rsync -avz --progress ~/vpn-dashboard/ ubuntu@YOUR_SERVER_IP:/home/ubuntu/vpn-dashboard/

This may take several minutes depending on your connection speed.

5.3 VERIFICATION
----------------
Back on the SERVER terminal, verify the files were uploaded:

    ls -la /home/ubuntu/vpn-dashboard/

You should see all project files and directories listed.

Check the directory size:

    du -sh /home/ubuntu/vpn-dashboard/

================================================================================
6. APPLICATION DEPLOYMENT
================================================================================

6.1 PROJECT EXTRACTION (IF UPLOADED AS ZIP)
--------------------------------------------
If you uploaded a ZIP file instead of the directory:

    cd /home/ubuntu
    unzip vpn-dashboard.zip
    cd vpn-dashboard

Otherwise, navigate to the project directory:

    cd /home/ubuntu/vpn-dashboard

6.2 DFX DEPLOYMENT
------------------
Start dfx in the background:

    dfx start --background

Wait for dfx to initialize (about 30 seconds).

Verify dfx is running:

    dfx ping

Expected output: "Ready"

Deploy the application canisters:

    dfx deploy

IMPORTANT: This process takes 5-10 minutes. Do NOT interrupt it.

You will see output similar to:

    Deploying all canisters.
    Creating canisters...
    Building canisters...
    Installing canisters...
    Deployed canisters.
    URLs:
      Frontend canister via browser
        frontend: http://127.0.0.1:4943/?canisterId=XXXXX-XXXXX-XXXXX
      Backend canister via Candid interface:
        backend: http://127.0.0.1:4943/?canisterId=YYYYY-YYYYY-YYYYY

SAVE THE FRONTEND CANISTER ID (XXXXX-XXXXX-XXXXX) - you'll need it to access
the dashboard.

Verify deployment:

    dfx canister status backend

Expected output: "Status: Running"

6.3 SERVICE CONFIGURATION (OPTIONAL - AUTO-START ON REBOOT)
------------------------------------------------------------
Create a systemd service for automatic startup:

    sudo tee /etc/systemd/system/wireguard-dashboard.service > /dev/null <<'EOF'
[Unit]
Description=WireGuard VPN Dashboard
After=network.target docker.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/vpn-dashboard
ExecStart=/home/ubuntu/bin/dfx start --background
ExecStop=/home/ubuntu/bin/dfx stop
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

Enable and start the service:

    sudo systemctl daemon-reload
    sudo systemctl enable wireguard-dashboard
    sudo systemctl start wireguard-dashboard

Verify service status:

    sudo systemctl status wireguard-dashboard

Expected: "active (running)"

6.4 FIREWALL CONFIGURATION
---------------------------
Configure UFW firewall to allow necessary ports:

    sudo ufw allow OpenSSH
    sudo ufw allow 51820/udp
    sudo ufw allow 4943/tcp
    sudo ufw enable

Verify firewall status:

    sudo ufw status

================================================================================
7. PROTON VPN PRO CONFIGURATION
================================================================================

7.1 DASHBOARD ACCESS
--------------------
Open your web browser and navigate to:

    http://YOUR_SERVER_IP:4943/?canisterId=FRONTEND_CANISTER_ID

Replace:
- YOUR_SERVER_IP with your server's public IP address
- FRONTEND_CANISTER_ID with the ID from step 6.2

Example:
    http://203.0.113.45:4943/?canisterId=rrkah-fqaaa-aaaaa-aaaaq-cai

7.2 INTERNET IDENTITY LOGIN
----------------------------
1. Click the "Login" button on the landing page
2. You will be redirected to Internet Identity authentication
3. If you don't have an Internet Identity:
   - Click "Create New" on the Internet Identity page
   - Follow the prompts to create your identity
   - Save your recovery phrase in a secure location
4. Complete the authentication process
5. You will be redirected back to the dashboard
6. Enter your admin name when prompted (first-time setup only)

7.3 CREDENTIALS ENTRY
----------------------
Once logged in:

1. Navigate to the "Settings" tab in the dashboard
2. Locate the "Proton VPN Configuration" section
3. Enter your Proton VPN Pro username
4. Enter your Proton VPN Pro password
5. Click "Save Credentials"

IMPORTANT: Only Proton VPN Pro accounts support WireGuard. Free accounts
will not work with this dashboard.

7.4 SERVER SELECTION
--------------------
The dashboard will automatically:
- Fetch available Proton VPN servers
- Filter for WireGuard-capable servers
- Prioritize low-load 10 Gbps servers near Raleigh, NC

You can manually refresh the server list if needed by clicking the
"Refresh Servers" button.

7.5 START VPN SERVICE
----------------------
1. Navigate to the "Overview" tab
2. Click the "Start Service" button
3. Monitor the server status - it should change to "Running"
4. Check tunnel health - it should show "Connected"

================================================================================
8. POST-DEPLOYMENT VERIFICATION
================================================================================

8.1 WIREGUARD TUNNEL CHECK
---------------------------
On the server, verify WireGuard is running:

    sudo wg show

Expected output: WireGuard interface configuration and peer information

Check WireGuard service status:

    sudo systemctl status wg-quick@wg0

Expected: "active (running)"

8.2 DASHBOARD ACCESS VERIFICATION
----------------------------------
In your web browser, verify you can access all dashboard tabs:

✓ Overview tab - Shows server status and metrics
✓ Peers tab - Shows peer list (empty initially)
✓ Settings tab - Shows Proton VPN configuration
✓ Deployment tab - Shows this guide

Check that the server status shows:
- Service Status: Running
- Tunnel Health: Connected
- Active Peers: 0 (initially)

8.3 PROTON CONNECTION TEST
---------------------------
Verify Proton VPN connection:

1. In the dashboard Overview tab, check "Tunnel Health" status
2. It should show "Connected" with a green indicator
3. Check the server metrics are updating in real-time

On the server, verify the Proton VPN tunnel:

    sudo wg show

You should see a peer entry for the Proton VPN endpoint.

Test internet connectivity through the tunnel:

    curl ifconfig.me

The IP address returned should be a Proton VPN IP, not your server's IP.

8.4 ADD TEST PEER
-----------------
Create a test VPN client:

1. Navigate to the "Peers" tab
2. Click "Add Peer"
3. Enter a name (e.g., "Test Client")
4. Click "Generate Configuration"
5. Download the configuration file or scan the QR code
6. Import into a WireGuard client app on your device
7. Connect and verify you can access the internet

Test the connection:
- Visit https://whatismyipaddress.com/
- Your IP should show a Proton VPN IP address
- DNS leaks should be prevented

================================================================================
9. TROUBLESHOOTING GUIDE
================================================================================

ISSUE: Cannot connect to dashboard
-----------------------------------
SYMPTOMS: Browser shows "Connection refused" or timeout

SOLUTIONS:
1. Check dfx is running:
   dfx ping

2. Verify firewall allows port 4943:
   sudo ufw status
   sudo ufw allow 4943/tcp

3. Check canister status:
   dfx canister status backend

4. Restart dfx:
   dfx stop
   dfx start --background
   dfx deploy

5. Check for port conflicts:
   sudo netstat -tulpn | grep 4943

ISSUE: WireGuard service won't start
-------------------------------------
SYMPTOMS: Service status shows "failed" or "inactive"

SOLUTIONS:
1. Check kernel module is loaded:
   lsmod | grep wireguard
   sudo modprobe wireguard

2. View detailed error logs:
   sudo journalctl -u wg-quick@wg0 -xe

3. Verify configuration file permissions:
   sudo chmod 600 /etc/wireguard/*.conf

4. Check configuration syntax:
   sudo wg-quick up wg0

5. Restart the service:
   sudo systemctl restart wg-quick@wg0

ISSUE: Docker permission denied
--------------------------------
SYMPTOMS: "permission denied while trying to connect to Docker daemon"

SOLUTIONS:
1. Verify user is in docker group:
   groups $USER

2. If not in docker group, add user:
   sudo usermod -aG docker $USER

3. Log out and back in:
   exit
   ssh ubuntu@YOUR_SERVER_IP

4. Or activate the group without logging out:
   newgrp docker

5. Verify Docker access:
   docker ps

ISSUE: Deployment fails
------------------------
SYMPTOMS: dfx deploy shows errors or hangs

SOLUTIONS:
1. Check disk space:
   df -h

2. Verify dfx version:
   dfx --version

3. Clean and retry:
   dfx stop
   dfx start --clean --background
   dfx deploy

4. Check for conflicting processes:
   ps aux | grep dfx
   pkill -9 dfx
   dfx start --background

5. Review deployment logs:
   dfx canister logs backend

ISSUE: Proton VPN connection fails
-----------------------------------
SYMPTOMS: Tunnel health shows "disconnected" or "error"

SOLUTIONS:
1. Verify you have a Pro account (free accounts don't support WireGuard)

2. Check credentials are correct in Settings tab

3. Try refreshing the server list

4. Check internet connectivity:
   ping 8.8.8.8

5. Review Proton VPN API response:
   dfx canister logs backend

6. Verify firewall allows outbound connections:
   sudo ufw status

ISSUE: Peers can't connect
---------------------------
SYMPTOMS: Client shows "handshake failed" or timeout

SOLUTIONS:
1. Verify firewall allows UDP port 51820:
   sudo ufw allow 51820/udp

2. Check WireGuard is running:
   sudo wg show

3. Verify peer configuration is correct:
   - Check endpoint IP matches your server
   - Verify allowed IPs are correct
   - Ensure public key matches

4. Check server logs:
   sudo journalctl -u wg-quick@wg0 -f

5. Test connectivity:
   ping YOUR_SERVER_IP

ISSUE: Internet Identity login fails
-------------------------------------
SYMPTOMS: Redirect loop or authentication error

SOLUTIONS:
1. Clear browser cache and cookies

2. Try a different browser

3. Verify Internet Identity service is accessible:
   Visit https://identity.ic0.app/

4. Check browser console for errors (F12)

5. Ensure cookies and JavaScript are enabled

ISSUE: High CPU or memory usage
--------------------------------
SYMPTOMS: Server becomes slow or unresponsive

SOLUTIONS:
1. Check resource usage:
   htop
   free -h

2. Review running processes:
   ps aux --sort=-%mem | head

3. Check dfx logs for errors:
   dfx canister logs backend

4. Restart services:
   sudo systemctl restart wireguard-dashboard

5. Consider upgrading server resources

================================================================================
10. SECURITY BEST PRACTICES
================================================================================

FIREWALL CONFIGURATION:
✓ Only allow necessary ports (SSH, WireGuard, dfx)
✓ Use UFW or iptables to restrict access
✓ Consider IP whitelisting for SSH access
✓ Regularly review firewall rules

SSH SECURITY:
✓ Use SSH key authentication instead of passwords
✓ Disable root login in /etc/ssh/sshd_config
✓ Change default SSH port if desired
✓ Install and configure fail2ban to prevent brute force attacks
✓ Use strong passphrases for SSH keys

SYSTEM UPDATES:
✓ Regularly update system packages:
  sudo apt update && sudo apt upgrade
✓ Enable automatic security updates:
  sudo apt install unattended-upgrades
  sudo dpkg-reconfigure -plow unattended-upgrades
✓ Monitor security advisories for Ubuntu
✓ Subscribe to security mailing lists

BACKUP STRATEGY:
✓ Backup WireGuard configurations: /etc/wireguard/
✓ Backup private keys securely (offline storage)
✓ Document your deployment configuration
✓ Test restore procedures regularly
✓ Use encrypted backups
✓ Store backups in multiple locations

MONITORING:
✓ Regularly check server logs:
  sudo journalctl -u wireguard-dashboard -f
✓ Monitor disk space and resource usage:
  df -h
  free -h
✓ Set up alerts for service failures
✓ Review peer connection logs weekly
✓ Monitor for unusual traffic patterns

ACCESS CONTROL:
✓ Use strong passwords for Proton VPN (20+ characters)
✓ Secure your Internet Identity with a strong passphrase
✓ Save Internet Identity recovery phrase offline
✓ Limit peer access to trusted devices only
✓ Regularly audit connected peers
✓ Remove unused peer configurations
✓ Use unique credentials for each service

WIREGUARD SECURITY:
✓ Rotate WireGuard keys periodically (every 6 months)
✓ Use strong pre-shared keys for additional security
✓ Limit allowed IPs to minimum required
✓ Monitor for unauthorized connection attempts
✓ Keep WireGuard updated to latest version

PROTON VPN SECURITY:
✓ Enable two-factor authentication on Proton account
✓ Use a unique password for Proton VPN
✓ Regularly review Proton VPN account activity
✓ Keep Proton VPN credentials secure (use password manager)

================================================================================
11. MAINTENANCE AND UPDATES
================================================================================

REGULAR MAINTENANCE TASKS:

DAILY:
- Check dashboard for any alerts or errors
- Verify all services are running
- Monitor active peer connections

WEEKLY:
- Review server logs for issues
- Check disk space usage
- Verify backup integrity
- Review peer connection logs
- Update peer configurations if needed

MONTHLY:
- Update system packages:
  sudo apt update && sudo apt upgrade
- Review and rotate logs
- Audit connected peers
- Check for dfx updates:
  dfx upgrade
- Review security advisories
- Test disaster recovery procedures

QUARTERLY:
- Rotate WireGuard keys
- Review and update firewall rules
- Audit access logs
- Update documentation
- Review and optimize server resources

UPDATING THE APPLICATION:

When a new version is released:

1. Backup current configuration:
   cd /home/ubuntu
   tar -czf vpn-dashboard-backup-$(date +%Y%m%d).tar.gz vpn-dashboard/

2. Stop the service:
   dfx stop

3. Upload new version files via SCP (from local machine):
   scp -r ~/vpn-dashboard/ ubuntu@YOUR_SERVER_IP:/home/ubuntu/vpn-dashboard-new/

4. On the server, replace old files:
   cd /home/ubuntu
   mv vpn-dashboard vpn-dashboard-old
   mv vpn-dashboard-new vpn-dashboard

5. Deploy the new version:
   cd /home/ubuntu/vpn-dashboard
   dfx start --background
   dfx deploy

6. Verify the update:
   dfx canister status backend

7. Test all functionality in the dashboard

8. If successful, remove old backup:
   rm -rf /home/ubuntu/vpn-dashboard-old

RESTARTING SERVICES:

Dashboard service:
    sudo systemctl restart wireguard-dashboard

WireGuard service:
    sudo systemctl restart wg-quick@wg0

Docker service:
    sudo systemctl restart docker

All services:
    sudo systemctl restart wireguard-dashboard wg-quick@wg0 docker

VIEWING LOGS:

Dashboard logs:
    dfx canister logs backend

System logs:
    sudo journalctl -u wireguard-dashboard -f

WireGuard logs:
    sudo journalctl -u wg-quick@wg0 -f

All logs:
    sudo journalctl -f

MONITORING COMMANDS:

System resources:
    htop
    top
    free -h
    df -h

Network connections:
    sudo netstat -tulpn
    sudo ss -tulpn

WireGuard status:
    sudo wg show
    sudo wg show wg0

Active peers:
    sudo wg show wg0 peers

Docker containers:
    docker ps
    docker stats

================================================================================
12. SUPPORT AND RESOURCES
================================================================================

OFFICIAL DOCUMENTATION:

Internet Computer:
    https://internetcomputer.org/docs

WireGuard:
    https://www.wireguard.com/
    https://www.wireguard.com/quickstart/

Proton VPN:
    https://protonvpn.com/support
    https://protonvpn.com/support/wireguard-configurations/

Ubuntu:
    https://help.ubuntu.com/
    https://ubuntu.com/server/docs

Docker:
    https://docs.docker.com/

USEFUL COMMANDS REFERENCE:

Dashboard Management:
    dfx start --background          # Start dfx
    dfx stop                         # Stop dfx
    dfx deploy                       # Deploy application
    dfx canister status backend      # Check backend status
    dfx canister logs backend        # View backend logs
    dfx ping                         # Test dfx connection

WireGuard Management:
    sudo wg show                     # Show all interfaces
    sudo wg show wg0                 # Show specific interface
    sudo wg show wg0 peers           # List all peers
    sudo wg-quick up wg0             # Start interface
    sudo wg-quick down wg0           # Stop interface
    sudo systemctl status wg-quick@wg0  # Check service status

System Monitoring:
    htop                             # Interactive process viewer
    top                              # Process monitor
    free -h                          # Memory usage
    df -h                            # Disk usage
    du -sh /path/to/dir              # Directory size
    uptime                           # System uptime
    sudo netstat -tulpn              # Network connections
    sudo ss -tulpn                   # Socket statistics

Service Management:
    sudo systemctl start SERVICE     # Start service
    sudo systemctl stop SERVICE      # Stop service
    sudo systemctl restart SERVICE   # Restart service
    sudo systemctl status SERVICE    # Check service status
    sudo systemctl enable SERVICE    # Enable on boot
    sudo systemctl disable SERVICE   # Disable on boot

Log Viewing:
    sudo journalctl -u SERVICE -f    # Follow service logs
    sudo journalctl -xe              # View recent logs
    tail -f /var/log/syslog          # Follow system log
    dmesg | tail                     # Kernel messages

COMMUNITY SUPPORT:

Internet Computer Forum:
    https://forum.dfinity.org/

WireGuard Mailing List:
    https://lists.zx2c4.com/mailman/listinfo/wireguard

Ubuntu Forums:
    https://ubuntuforums.org/

Stack Overflow:
    https://stackoverflow.com/questions/tagged/wireguard
    https://stackoverflow.com/questions/tagged/internet-computer

================================================================================
DEPLOYMENT CHECKLIST
================================================================================

Use this checklist to verify your deployment:

PRE-DEPLOYMENT:
☐ Ubuntu 26.04 server provisioned
☐ SSH access configured
☐ Server IP address documented
☐ Proton VPN Pro account created
☐ Project files ready in ~/vpn-dashboard/

INSTALLATION:
☐ System packages updated
☐ Essential packages installed
☐ dfx installed and in PATH
☐ Docker installed and running
☐ WireGuard installed and kernel module loaded
☐ Firewall configured

FILE TRANSFER:
☐ Project files uploaded via SCP
☐ Files verified on server
☐ Correct permissions set

DEPLOYMENT:
☐ dfx started in background
☐ Application deployed successfully
☐ Frontend canister ID saved
☐ Backend canister running
☐ Systemd service created (optional)
☐ Service enabled and started

CONFIGURATION:
☐ Dashboard accessible via browser
☐ Internet Identity login successful
☐ Admin profile created
☐ Proton VPN credentials saved
☐ Server list fetched
☐ VPN service started

VERIFICATION:
☐ WireGuard tunnel active
☐ Tunnel health shows "Connected"
☐ Test peer created
☐ Test peer can connect
☐ Internet access through VPN verified
☐ IP address shows Proton VPN IP

POST-DEPLOYMENT:
☐ Backup created
☐ Documentation updated
☐ Monitoring configured
☐ Security hardening completed
☐ Team members notified

================================================================================
CONCLUSION
================================================================================

Congratulations! You have successfully deployed the WireGuard VPN Management
Dashboard. Your VPN server is now running and ready to accept client
connections.

NEXT STEPS:

1. Add VPN clients (peers) through the dashboard
2. Distribute configurations to users
3. Monitor connections and usage
4. Set up regular backups
5. Configure monitoring and alerts
6. Review security settings
7. Document any custom configurations

IMPORTANT REMINDERS:

• Keep your Proton VPN Pro subscription active
• Regularly update system packages
• Monitor server resources and logs
• Backup configurations before making changes
• Test disaster recovery procedures
• Keep Internet Identity recovery phrase secure
• Rotate WireGuard keys periodically

For questions, issues, or support, refer to the Troubleshooting section
and official documentation links provided in this guide.

Thank you for using the WireGuard VPN Management Dashboard!

================================================================================
END OF FINAL DEPLOYMENT DOCUMENT
================================================================================
`;

export default function FinalDeploymentDocument() {
  const { data: savedDocument, isLoading } = useGetFinalDeploymentDocument();
  const saveDocumentMutation = useSaveFinalDeploymentDocument();
  
  const [documentContent, setDocumentContent] = useState(DEFAULT_DOCUMENT);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (savedDocument) {
      setDocumentContent(savedDocument.content);
    }
  }, [savedDocument]);

  const handleSave = () => {
    const now = BigInt(Date.now() * 1000000);
    saveDocumentMutation.mutate({
      content: documentContent,
      createdAt: savedDocument?.createdAt || now,
      lastModified: now,
    });
    setIsEditing(false);
  };

  const handleReset = () => {
    setDocumentContent(DEFAULT_DOCUMENT);
    toast.info('Document reset to default template');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(documentContent);
    setCopied(true);
    toast.success('Document copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([documentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wireguard-vpn-final-deployment-guide.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Document downloaded');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Final Deployment Document
          </CardTitle>
          <CardDescription>
            Complete deployment guide with installation, configuration, verification, and troubleshooting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              disabled={saveDocumentMutation.isPending}
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              disabled={saveDocumentMutation.isPending}
            >
              <Download className="mr-2 h-4 w-4" />
              Download as .txt
            </Button>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                Edit Document
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={saveDocumentMutation.isPending}
                >
                  {saveDocumentMutation.isPending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    if (savedDocument) {
                      setDocumentContent(savedDocument.content);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  disabled={saveDocumentMutation.isPending}
                >
                  Cancel
                </Button>
              </>
            )}
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              disabled={saveDocumentMutation.isPending}
            >
              Reset to Default
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={documentContent}
                onChange={(e) => setDocumentContent(e.target.value)}
                className="min-h-[600px] font-mono text-sm"
                placeholder="Enter deployment document content..."
              />
              <p className="text-xs text-muted-foreground">
                Edit the document content above. Use plain text formatting for best compatibility.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/50">
              <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
                {documentContent}
              </pre>
            </div>
          )}

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h4 className="mb-2 font-medium text-sm">Document Features</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Complete installation instructions for Ubuntu 26.04 with all package installations</li>
              <li>• Detailed Docker and dfx installation steps with proper PATH configuration</li>
              <li>• WireGuard configuration and setup instructions</li>
              <li>• SSH and SCP commands for uploading app files from local machine</li>
              <li>• Step-by-step dfx deploy instructions with verification steps</li>
              <li>• Comprehensive Proton VPN Pro configuration with credentials entry and server selection</li>
              <li>• Post-deployment verification checklist covering WireGuard tunnel, dashboard access, and Proton connection</li>
              <li>• Extensive troubleshooting guide with common issues and solutions</li>
              <li>• Security best practices and maintenance recommendations</li>
            </ul>
          </div>

          {savedDocument && (
            <div className="text-xs text-muted-foreground">
              Last modified: {new Date(Number(savedDocument.lastModified) / 1000000).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
