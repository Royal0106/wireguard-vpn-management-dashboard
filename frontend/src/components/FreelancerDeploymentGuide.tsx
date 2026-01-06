import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Download, FileText, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useGetDeploymentGuide, useSaveDeploymentGuide } from '../hooks/useQueries';

const DEFAULT_GUIDE = `================================================================================
WIREGUARD VPN MANAGEMENT DASHBOARD - DEPLOYMENT GUIDE FOR FREELANCERS
================================================================================

VERSION: v5
LAST UPDATED: ${new Date().toISOString().split('T')[0]}

================================================================================
1. OVERVIEW
================================================================================

This application is a web-based management dashboard for administering a 
dedicated WireGuard VPN host with Proton VPN Pro integration. It provides:

- Secure VPN server management with WireGuard protocol
- Automated routing through Proton VPN Pro endpoints
- Client peer management with QR code generation
- Real-time monitoring and connection statistics
- Admin authentication via Internet Identity

The dashboard runs on the Internet Computer blockchain platform, providing
secure and decentralized hosting for your VPN management interface.

================================================================================
2. PREREQUISITES
================================================================================

Before starting deployment, ensure you have:

SERVER REQUIREMENTS:
- Ubuntu 26.04 LTS server (fresh installation recommended)
- Minimum 2GB RAM, 2 CPU cores
- At least 10GB free disk space
- Public IP address for VPN connectivity
- Root or sudo access

ACCESS REQUIREMENTS:
- SSH access to the server (username and password or SSH key)
- Server IP address
- Internet connectivity on both local machine and server

CREDENTIALS NEEDED:
- Proton VPN Pro account (username and password)
  Note: Free Proton VPN accounts do NOT support WireGuard

LOCAL SETUP:
- Project files located in ~/vpn-dashboard/ on your local machine
- SSH client installed (OpenSSH, PuTTY, etc.)
- SCP or rsync for file transfer

================================================================================
3. SYSTEM PREPARATION
================================================================================

Connect to your server via SSH:

    ssh ubuntu@YOUR_SERVER_IP

Replace YOUR_SERVER_IP with your actual server IP address throughout this guide.

Once connected, run the following commands:

3.1 UPDATE SYSTEM PACKAGES
---------------------------
    sudo apt update
    sudo apt upgrade -y

3.2 INSTALL ESSENTIAL PACKAGES
-------------------------------
    sudo apt install -y curl git build-essential unzip

3.3 CONFIGURE FIREWALL (OPTIONAL BUT RECOMMENDED)
--------------------------------------------------
    sudo ufw allow OpenSSH
    sudo ufw allow 51820/udp
    sudo ufw allow 4943/tcp
    sudo ufw enable

================================================================================
4. UPLOADING THE V5 APP ZIP
================================================================================

From your LOCAL machine (not the server), upload the project files:

4.1 USING SCP (RECOMMENDED)
----------------------------
    scp -r ~/vpn-dashboard/ ubuntu@YOUR_SERVER_IP:/home/ubuntu/

If using a custom SSH key:
    scp -i /path/to/your-key.pem -r ~/vpn-dashboard/ ubuntu@YOUR_SERVER_IP:/home/ubuntu/

4.2 USING RSYNC (ALTERNATIVE)
------------------------------
    rsync -avz --progress ~/vpn-dashboard/ ubuntu@YOUR_SERVER_IP:/home/ubuntu/vpn-dashboard/

4.3 VERIFY UPLOAD
-----------------
SSH back into the server and check:
    ssh ubuntu@YOUR_SERVER_IP
    ls -la /home/ubuntu/vpn-dashboard/

You should see all project files listed.

================================================================================
5. DEPLOYMENT INSTRUCTIONS
================================================================================

All commands below should be run on the SERVER (via SSH).

5.1 NAVIGATE TO PROJECT DIRECTORY
----------------------------------
    cd /home/ubuntu/vpn-dashboard

5.2 INSTALL DFX (INTERNET COMPUTER SDK)
----------------------------------------
    sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
    
Add dfx to your PATH:
    echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc

Verify installation:
    dfx --version

5.3 INSTALL DOCKER
------------------
    sudo apt install -y docker.io
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER

IMPORTANT: Log out and log back in for Docker group permissions to take effect:
    exit
    ssh ubuntu@YOUR_SERVER_IP
    cd /home/ubuntu/vpn-dashboard

Verify Docker:
    docker --version

5.4 INSTALL WIREGUARD
---------------------
    sudo apt install -y wireguard wireguard-tools
    sudo modprobe wireguard
    echo "wireguard" | sudo tee -a /etc/modules

Verify WireGuard:
    sudo wg --version
    lsmod | grep wireguard

5.5 DEPLOY THE APPLICATION
---------------------------
Start dfx in the background:
    dfx start --background

Deploy the canisters (this may take 5-10 minutes):
    dfx deploy

IMPORTANT: Save the output! You'll see something like:
    URLs:
      Frontend canister via browser
        frontend: http://127.0.0.1:4943/?canisterId=XXXXX-XXXXX-XXXXX
      Backend canister via Candid interface:
        backend: http://127.0.0.1:4943/?canisterId=YYYYY-YYYYY-YYYYY

Save the frontend canister ID (XXXXX-XXXXX-XXXXX) for accessing the dashboard.

5.6 VERIFY DEPLOYMENT
----------------------
    dfx canister status backend

You should see "Status: Running"

5.7 CREATE SYSTEMD SERVICE (OPTIONAL - AUTO-START ON REBOOT)
-------------------------------------------------------------
Create the service file:
    sudo tee /etc/systemd/system/wireguard-dashboard.service > /dev/null <<EOF
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

Check service status:
    sudo systemctl status wireguard-dashboard

================================================================================
6. PROTON VPN CONFIGURATION
================================================================================

6.1 ACCESS THE DASHBOARD
-------------------------
Open your web browser and navigate to:
    http://YOUR_SERVER_IP:4943/?canisterId=FRONTEND_CANISTER_ID

Replace:
- YOUR_SERVER_IP with your server's public IP
- FRONTEND_CANISTER_ID with the ID from step 5.5

6.2 LOGIN WITH INTERNET IDENTITY
---------------------------------
1. Click the "Login" button on the landing page
2. Follow the Internet Identity authentication flow
3. If you don't have an Internet Identity, create one (it's free)
4. Complete the profile setup by entering your admin name

6.3 CONFIGURE PROTON VPN CREDENTIALS
-------------------------------------
1. Navigate to the "Settings" tab in the dashboard
2. Enter your Proton VPN Pro username
3. Enter your Proton VPN Pro password
4. Click "Save Credentials"

IMPORTANT: Only Proton VPN Pro accounts support WireGuard. Free accounts
will not work with this dashboard.

6.4 SELECT PROTON VPN SERVERS
------------------------------
The dashboard will automatically:
- Fetch available Proton VPN servers
- Filter for WireGuard-capable servers
- Prioritize low-load 10 Gbps servers near Raleigh, NC

You can manually refresh the server list if needed.

================================================================================
7. WIREGUARD MANAGEMENT
================================================================================

7.1 START THE VPN SERVICE
--------------------------
1. Go to the "Overview" tab
2. Click "Start Service"
3. Monitor the server status - it should show "Running"
4. Check tunnel health - it should show "Connected"

7.2 ADD VPN CLIENTS (PEERS)
----------------------------
1. Navigate to the "Peers" tab
2. Click "Add Peer"
3. Enter a name for the client (e.g., "John's Laptop")
4. The system will automatically generate keys and configuration
5. Download the configuration file OR scan the QR code with your mobile device
6. Import the configuration into your WireGuard client app

7.3 MANAGE EXISTING PEERS
--------------------------
- View all connected peers in the "Peers" tab
- See connection status and data usage
- Remove peers by clicking the delete button
- Download configurations again if needed

================================================================================
8. VERIFICATION AND TESTING
================================================================================

8.1 VERIFY SERVER STATUS
------------------------
In the dashboard "Overview" tab, check:
- Service Status: Should show "Running"
- Active Peers: Should show number of connected clients
- Tunnel Health: Should show "Connected" to Proton VPN
- CPU/Memory Usage: Should show reasonable values

8.2 TEST VPN CONNECTION
------------------------
On a client device with WireGuard installed:
1. Import the peer configuration
2. Connect to the VPN
3. Check your IP address: https://whatismyipaddress.com/
4. It should show a Proton VPN IP address, not your real IP

8.3 VERIFY LOGS
---------------
On the server, check logs:
    dfx canister logs backend
    sudo journalctl -u wireguard-dashboard -f
    sudo wg show

================================================================================
9. TROUBLESHOOTING
================================================================================

ISSUE: Cannot connect to dashboard
SOLUTION:
- Check firewall: sudo ufw status
- Verify dfx is running: dfx ping
- Check canister status: dfx canister status backend
- Ensure port 4943 is open: sudo ufw allow 4943/tcp

ISSUE: WireGuard service won't start
SOLUTION:
- Check kernel module: lsmod | grep wireguard
- View system logs: sudo journalctl -xe
- Verify permissions: sudo chmod 600 /etc/wireguard/*.conf
- Restart service: sudo systemctl restart wg-quick@wg0

ISSUE: Docker permission denied
SOLUTION:
- Log out and back in after adding user to docker group
- Or run: newgrp docker
- Verify: docker ps

ISSUE: Deployment fails
SOLUTION:
- Check disk space: df -h
- Verify dfx version: dfx --version
- Clean and retry: dfx stop && dfx start --clean --background
- Check for port conflicts: sudo netstat -tulpn | grep 4943

ISSUE: Proton VPN connection fails
SOLUTION:
- Verify you have a Pro account (free accounts don't support WireGuard)
- Check credentials are correct
- Try refreshing server list
- Check internet connectivity: ping 8.8.8.8

ISSUE: Peers can't connect
SOLUTION:
- Verify firewall allows UDP port 51820: sudo ufw allow 51820/udp
- Check WireGuard is running: sudo wg show
- Verify peer configuration is correct
- Check server logs: sudo journalctl -u wg-quick@wg0

================================================================================
10. SECURITY RECOMMENDATIONS
================================================================================

1. FIREWALL CONFIGURATION
   - Only allow necessary ports (SSH, WireGuard, dfx)
   - Use UFW or iptables to restrict access
   - Consider IP whitelisting for SSH

2. SSH SECURITY
   - Use SSH key authentication instead of passwords
   - Disable root login: edit /etc/ssh/sshd_config
   - Change default SSH port if desired
   - Use fail2ban to prevent brute force attacks

3. SYSTEM UPDATES
   - Regularly update system: sudo apt update && sudo apt upgrade
   - Enable automatic security updates
   - Monitor security advisories for Ubuntu

4. BACKUP STRATEGY
   - Backup WireGuard configurations: /etc/wireguard/
   - Backup private keys securely
   - Document your deployment configuration
   - Test restore procedures

5. MONITORING
   - Regularly check server logs
   - Monitor disk space and resource usage
   - Set up alerts for service failures
   - Review peer connection logs

6. ACCESS CONTROL
   - Use strong passwords for Proton VPN
   - Secure your Internet Identity
   - Limit peer access to trusted devices only
   - Regularly audit connected peers

================================================================================
11. MAINTENANCE
================================================================================

REGULAR TASKS:
- Check dashboard weekly for updates
- Review peer connections and remove unused ones
- Monitor server resource usage
- Update system packages monthly
- Backup configurations before making changes

UPDATING THE APPLICATION:
1. Stop the service: dfx stop
2. Upload new version files via SCP
3. Deploy: dfx deploy
4. Verify: dfx canister status backend

RESTARTING SERVICES:
- Dashboard: sudo systemctl restart wireguard-dashboard
- WireGuard: sudo systemctl restart wg-quick@wg0
- Docker: sudo systemctl restart docker

================================================================================
12. SUPPORT AND RESOURCES
================================================================================

DOCUMENTATION:
- Internet Computer: https://internetcomputer.org/docs
- WireGuard: https://www.wireguard.com/
- Proton VPN: https://protonvpn.com/support
- Ubuntu: https://help.ubuntu.com/

COMMON COMMANDS REFERENCE:
- View dashboard logs: dfx canister logs backend
- Check WireGuard status: sudo wg show
- List active peers: sudo wg show wg0 peers
- Monitor system resources: htop or top
- Check service status: sudo systemctl status wireguard-dashboard

================================================================================
END OF DEPLOYMENT GUIDE
================================================================================

For questions or issues, please refer to the troubleshooting section above
or consult the official documentation links provided.

Good luck with your deployment!
`;

export default function FreelancerDeploymentGuide() {
  const { data: savedGuide, isLoading } = useGetDeploymentGuide();
  const saveGuideMutation = useSaveDeploymentGuide();
  
  const [guideContent, setGuideContent] = useState(DEFAULT_GUIDE);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (savedGuide) {
      setGuideContent(savedGuide.content);
    }
  }, [savedGuide]);

  const handleSave = () => {
    const now = BigInt(Date.now() * 1000000);
    saveGuideMutation.mutate({
      content: guideContent,
      createdAt: savedGuide?.createdAt || now,
      lastModified: now,
    });
    setIsEditing(false);
  };

  const handleReset = () => {
    setGuideContent(DEFAULT_GUIDE);
    toast.info('Guide reset to default template');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(guideContent);
    setCopied(true);
    toast.success('Guide copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([guideContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wireguard-vpn-deployment-guide.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Guide downloaded');
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
            Freelancer Deployment Guide
          </CardTitle>
          <CardDescription>
            Comprehensive plain-text deployment guide ready to share with technical freelancers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              disabled={saveGuideMutation.isPending}
            >
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              disabled={saveGuideMutation.isPending}
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
                Edit Guide
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  size="sm"
                  disabled={saveGuideMutation.isPending}
                >
                  {saveGuideMutation.isPending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    if (savedGuide) {
                      setGuideContent(savedGuide.content);
                    }
                  }}
                  variant="outline"
                  size="sm"
                  disabled={saveGuideMutation.isPending}
                >
                  Cancel
                </Button>
              </>
            )}
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              disabled={saveGuideMutation.isPending}
            >
              Reset to Default
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={guideContent}
                onChange={(e) => setGuideContent(e.target.value)}
                className="min-h-[600px] font-mono text-sm"
                placeholder="Enter deployment guide content..."
              />
              <p className="text-xs text-muted-foreground">
                Edit the guide content above. Use plain text formatting for best compatibility.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/50">
              <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
                {guideContent}
              </pre>
            </div>
          )}

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h4 className="mb-2 font-medium text-sm">Usage Instructions</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Click "Copy to Clipboard" to copy the entire guide for email or messaging</li>
              <li>• Click "Download as .txt" to save as a plain text file for sharing</li>
              <li>• Click "Edit Guide" to customize the content for your specific deployment</li>
              <li>• The guide includes all necessary steps, commands, and troubleshooting tips</li>
              <li>• Share this guide with freelancers or team members who need to deploy the VPN dashboard</li>
            </ul>
          </div>

          {savedGuide && (
            <div className="text-xs text-muted-foreground">
              Last modified: {new Date(Number(savedGuide.lastModified) / 1000000).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

