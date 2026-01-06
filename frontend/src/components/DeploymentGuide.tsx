import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, Check, Terminal, Server, Upload, Settings as SettingsIcon, AlertCircle, FileText, CheckSquare } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import InstallationScriptManager from './InstallationScriptManager';
import FreelancerDeploymentGuide from './FreelancerDeploymentGuide';
import FinalDeploymentDocument from './FinalDeploymentDocument';
import FreelancerDeploymentChecklist from './FreelancerDeploymentChecklist';

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language = 'bash' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
        <code className="text-foreground">{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-2 top-2 h-8 w-8"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}

export default function DeploymentGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Deployment Guide</h2>
        <p className="text-muted-foreground">
          Follow these steps to deploy the VPN dashboard to your Ubuntu 26.04 server
        </p>
      </div>

      <Tabs defaultValue="checklist" className="space-y-6">
        <TabsList className="grid w-full max-w-6xl grid-cols-8">
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="final">Final Guide</TabsTrigger>
          <TabsTrigger value="freelancer">Freelancer</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
          <TabsTrigger value="configure">Configure</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-4">
          <FreelancerDeploymentChecklist />
        </TabsContent>

        <TabsContent value="final" className="space-y-4">
          <FinalDeploymentDocument />
        </TabsContent>

        <TabsContent value="freelancer" className="space-y-4">
          <FreelancerDeploymentGuide />
        </TabsContent>

        <TabsContent value="script" className="space-y-4">
          <InstallationScriptManager />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Prerequisites
              </CardTitle>
              <CardDescription>
                What you'll need before starting the deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Server Requirements</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Ubuntu 26.04 LTS server with root or sudo access</li>
                  <li>Minimum 2GB RAM, 2 CPU cores recommended</li>
                  <li>At least 10GB free disk space</li>
                  <li>Public IP address for VPN connectivity</li>
                  <li>SSH access enabled</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Local Requirements</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Project files in <code className="rounded bg-muted px-1 py-0.5">~/vpn-dashboard/</code></li>
                  <li>SSH client installed</li>
                  <li>SCP or rsync for file transfer</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Credentials Needed</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Server IP address</li>
                  <li>SSH username (typically 'ubuntu' or 'root')</li>
                  <li>SSH key or password</li>
                  <li>Proton VPN Pro account credentials (for post-deployment)</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Replace <code className="rounded bg-muted px-1 py-0.5">your-server-ip</code> with your actual VPS IP address in all commands below.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deployment Process Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">1</span>
                  <div>
                    <strong>Use Installation Script (Recommended)</strong>
                    <p className="text-muted-foreground">Download and run the automated installation script for quick setup</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">2</span>
                  <div>
                    <strong>Upload Project Files</strong>
                    <p className="text-muted-foreground">Transfer your local project to the remote server using SCP</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">3</span>
                  <div>
                    <strong>Install Dependencies</strong>
                    <p className="text-muted-foreground">Install dfx, Docker, and WireGuard on the server</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">4</span>
                  <div>
                    <strong>Deploy Application</strong>
                    <p className="text-muted-foreground">Run dfx deploy to build and start the application</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">5</span>
                  <div>
                    <strong>Configure VPN</strong>
                    <p className="text-muted-foreground">Set up Proton VPN credentials through the dashboard UI</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Step 1: Upload Project Files
              </CardTitle>
              <CardDescription>
                Transfer your local project to the remote server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Using SCP (Recommended)</h4>
                <p className="text-sm text-muted-foreground">
                  Copy the entire project directory to the server:
                </p>
                <CodeBlock code="scp -r ~/vpn-dashboard/ ubuntu@your-server-ip:/home/ubuntu/" />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Using rsync (Alternative)</h4>
                <p className="text-sm text-muted-foreground">
                  For faster transfers with resume capability:
                </p>
                <CodeBlock code="rsync -avz --progress ~/vpn-dashboard/ ubuntu@your-server-ip:/home/ubuntu/vpn-dashboard/" />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  If using a custom SSH key, add <code className="rounded bg-muted px-1 py-0.5">-i /path/to/key.pem</code> to the command.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Verify Upload</h4>
                <p className="text-sm text-muted-foreground">
                  SSH into the server and check the files:
                </p>
                <CodeBlock code={`ssh ubuntu@your-server-ip
ls -la /home/ubuntu/vpn-dashboard/`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deploy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Step 2: SSH and Deploy
              </CardTitle>
              <CardDescription>
                Connect to your server and run the deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Connect to Server</h4>
                <CodeBlock code="ssh ubuntu@your-server-ip" />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">2. Navigate to Project Directory</h4>
                <CodeBlock code="cd /home/ubuntu/vpn-dashboard" />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">3. Update System Packages</h4>
                <CodeBlock code={`sudo apt update
sudo apt upgrade -y`} />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">4. Install Base Dependencies</h4>
                <CodeBlock code="sudo apt install -y curl git build-essential" />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">5. Install dfx (Internet Computer SDK)</h4>
                <CodeBlock code={`sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc`} />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">6. Install Docker</h4>
                <CodeBlock code={`sudo apt install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER`} />
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You may need to log out and back in for Docker group permissions to take effect.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">7. Install WireGuard</h4>
                <CodeBlock code={`sudo apt install -y wireguard
sudo modprobe wireguard
echo "wireguard" | sudo tee -a /etc/modules`} />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">8. Deploy the Application</h4>
                <CodeBlock code={`cd /home/ubuntu/vpn-dashboard
dfx start --background
dfx deploy`} />
                <p className="text-sm text-muted-foreground">
                  This process may take 5-10 minutes. Wait for completion before proceeding.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">9. Verify Deployment</h4>
                <CodeBlock code="dfx canister status backend" />
                <p className="text-sm text-muted-foreground">
                  You should see the canister status as "Running".
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optional: Create Systemd Service</CardTitle>
              <CardDescription>
                Auto-start the dashboard on server reboot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Create Service File</h4>
                <CodeBlock code={`sudo tee /etc/systemd/system/wireguard-dashboard.service > /dev/null <<EOF
[Unit]
Description=WireGuard VPN Dashboard
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/vpn-dashboard
ExecStart=/home/ubuntu/bin/dfx start --background
ExecStop=/home/ubuntu/bin/dfx stop
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF`} />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Enable and Start Service</h4>
                <CodeBlock code={`sudo systemctl daemon-reload
sudo systemctl enable wireguard-dashboard
sudo systemctl start wireguard-dashboard`} />
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Check Service Status</h4>
                <CodeBlock code="sudo systemctl status wireguard-dashboard" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Step 3: Post-Deployment Configuration
              </CardTitle>
              <CardDescription>
                Configure your VPN dashboard after deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. Access the Dashboard</h4>
                <p className="text-sm text-muted-foreground">
                  Open your browser and navigate to:
                </p>
                <CodeBlock code="http://your-server-ip:4943/?canisterId=<canister-id>" />
                <p className="text-sm text-muted-foreground">
                  The canister ID will be displayed after running <code className="rounded bg-muted px-1 py-0.5">dfx deploy</code>.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">2. Login with Internet Identity</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Click the "Login" button on the landing page</li>
                  <li>Follow the Internet Identity authentication flow</li>
                  <li>Create a new Internet Identity if you don't have one</li>
                  <li>Complete the profile setup by entering your admin name</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">3. Configure Proton VPN Credentials</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Navigate to the "Settings" tab in the dashboard</li>
                  <li>Enter your Proton VPN Pro username</li>
                  <li>Enter your Proton VPN Pro password</li>
                  <li>Click "Save Credentials" to store them securely</li>
                </ul>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You must have a Proton VPN Pro account to use the VPN routing features. Free accounts do not support WireGuard.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">4. Start WireGuard Service</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Go to the "Overview" tab</li>
                  <li>Click the "Start Service" button</li>
                  <li>Monitor the server status and tunnel health</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">5. Add VPN Peers (Clients)</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Navigate to the "Peers" tab</li>
                  <li>Click "Add Peer" to create a new client configuration</li>
                  <li>Download the configuration file or scan the QR code</li>
                  <li>Import the configuration into your WireGuard client</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Common Issues</h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="text-foreground">Cannot connect to dashboard</strong>
                    <ul className="ml-4 mt-1 list-inside list-disc text-muted-foreground">
                      <li>Check firewall rules: <code className="rounded bg-muted px-1 py-0.5">sudo ufw allow 4943</code></li>
                      <li>Verify dfx is running: <code className="rounded bg-muted px-1 py-0.5">dfx ping</code></li>
                      <li>Check canister status: <code className="rounded bg-muted px-1 py-0.5">dfx canister status backend</code></li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-foreground">WireGuard service won't start</strong>
                    <ul className="ml-4 mt-1 list-inside list-disc text-muted-foreground">
                      <li>Verify kernel module: <code className="rounded bg-muted px-1 py-0.5">lsmod | grep wireguard</code></li>
                      <li>Check system logs: <code className="rounded bg-muted px-1 py-0.5">sudo journalctl -u wg-quick@wg0</code></li>
                      <li>Ensure proper permissions: <code className="rounded bg-muted px-1 py-0.5">sudo chmod 600 /etc/wireguard/*.conf</code></li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-foreground">Docker permission denied</strong>
                    <ul className="ml-4 mt-1 list-inside list-disc text-muted-foreground">
                      <li>Log out and back in after adding user to docker group</li>
                      <li>Or run: <code className="rounded bg-muted px-1 py-0.5">newgrp docker</code></li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-foreground">Deployment fails</strong>
                    <ul className="ml-4 mt-1 list-inside list-disc text-muted-foreground">
                      <li>Check disk space: <code className="rounded bg-muted px-1 py-0.5">df -h</code></li>
                      <li>Verify dfx version: <code className="rounded bg-muted px-1 py-0.5">dfx --version</code></li>
                      <li>Clean and retry: <code className="rounded bg-muted px-1 py-0.5">dfx stop && dfx start --clean --background</code></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">View Logs</h4>
                <CodeBlock code={`# dfx logs
dfx canister logs backend

# System logs
sudo journalctl -u wireguard-dashboard -f

# WireGuard logs
sudo wg show`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Enable UFW firewall and only allow necessary ports (SSH, WireGuard, dfx)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Use SSH key authentication instead of passwords</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Keep your system updated: <code className="rounded bg-muted px-1 py-0.5">sudo apt update && sudo apt upgrade</code></span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Regularly backup your WireGuard configurations and keys</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Monitor server logs for suspicious activity</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Use strong passwords for Proton VPN and Internet Identity</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
