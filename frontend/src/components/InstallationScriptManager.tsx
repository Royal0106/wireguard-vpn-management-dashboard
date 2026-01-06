import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Copy, Check, FileCode, AlertCircle, Save, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGetInstallationScript, useSaveInstallationScript } from '../hooks/useQueries';
import { toast } from 'sonner';

const DEFAULT_SCRIPT = `#!/bin/bash
set -e

echo "=========================================="
echo "WireGuard VPN Dashboard Installation"
echo "Ubuntu 26.04 LTS"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root or with sudo"
  exit 1
fi

echo "[1/9] Updating system packages..."
apt update
apt upgrade -y

echo "[2/9] Installing base dependencies..."
apt install -y curl git build-essential unzip

echo "[3/9] Installing dfx (Internet Computer SDK)..."
if ! command -v dfx &> /dev/null; then
  sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
  export PATH="$HOME/bin:$PATH"
  echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
else
  echo "dfx already installed"
fi

echo "[4/9] Installing Docker..."
if ! command -v docker &> /dev/null; then
  apt install -y docker.io
  systemctl enable docker
  systemctl start docker
  usermod -aG docker $USER
else
  echo "Docker already installed"
fi

echo "[5/9] Installing WireGuard..."
apt install -y wireguard
modprobe wireguard
echo "wireguard" | tee -a /etc/modules

echo "[6/9] Creating deployment directory..."
DEPLOY_DIR="/opt/vpn-dashboard"
mkdir -p $DEPLOY_DIR

echo "[7/9] Checking for project files..."
if [ -f "vpn-dashboard.zip" ]; then
  echo "Found vpn-dashboard.zip, extracting..."
  unzip -o vpn-dashboard.zip -d $DEPLOY_DIR
elif [ -d "vpn-dashboard" ]; then
  echo "Found vpn-dashboard directory, copying..."
  cp -r vpn-dashboard/* $DEPLOY_DIR/
else
  echo ""
  echo "=========================================="
  echo "WARNING: Project files not found!"
  echo "=========================================="
  echo ""
  echo "Please upload your project files to this server:"
  echo "  Option 1: Upload vpn-dashboard.zip to current directory"
  echo "  Option 2: Upload vpn-dashboard/ directory to current directory"
  echo ""
  echo "Then run this script again."
  echo ""
  exit 1
fi

echo "[8/9] Deploying application..."
cd $DEPLOY_DIR

# Start dfx in background
dfx start --background

# Wait for dfx to be ready
sleep 5

# Deploy the canister
dfx deploy

echo "[9/9] Creating systemd service..."
cat > /etc/systemd/system/wireguard-dashboard.service <<EOF
[Unit]
Description=WireGuard VPN Dashboard
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$DEPLOY_DIR
ExecStart=/root/bin/dfx start --background
ExecStop=/root/bin/dfx stop
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable wireguard-dashboard
systemctl start wireguard-dashboard

echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Access the dashboard at: http://$(hostname -I | awk '{print $1}'):4943/?canisterId=<canister-id>"
echo "2. Login with Internet Identity"
echo "3. Complete your profile setup"
echo "4. Navigate to Settings tab"
echo "5. Add your Proton VPN Pro WireGuard credentials"
echo ""
echo "To view canister ID, run:"
echo "  cd $DEPLOY_DIR && dfx canister id backend"
echo ""
echo "To check service status:"
echo "  systemctl status wireguard-dashboard"
echo ""
echo "=========================================="
`;

export default function InstallationScriptManager() {
  const { data: savedScript, isLoading } = useGetInstallationScript();
  const saveScript = useSaveInstallationScript();
  const [scriptContent, setScriptContent] = useState(DEFAULT_SCRIPT);
  const [copied, setCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (savedScript) {
      setScriptContent(savedScript.content);
      setHasChanges(false);
    }
  }, [savedScript]);

  const handleScriptChange = (value: string) => {
    setScriptContent(value);
    setHasChanges(true);
  };

  const handleSave = () => {
    const now = BigInt(Date.now() * 1000000);
    saveScript.mutate({
      content: scriptContent,
      createdAt: savedScript?.createdAt || now,
      lastModified: now,
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setScriptContent(DEFAULT_SCRIPT);
    setHasChanges(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    toast.success('Script copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'install_vpn_dashboard.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Script downloaded');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading installation script...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Ubuntu 26.04 Installation Script
          </CardTitle>
          <CardDescription>
            Automated installation script for deploying the VPN dashboard on Ubuntu 26.04 servers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This script automates the entire deployment process including system updates, dependency installation (dfx, Docker, WireGuard), project extraction, and service configuration.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Script Content</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  disabled={saveScript.isPending}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset to Default
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            <Textarea
              value={scriptContent}
              onChange={(e) => handleScriptChange(e.target.value)}
              className="font-mono text-xs"
              rows={20}
              placeholder="Enter installation script content..."
            />
          </div>

          {hasChanges && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have unsaved changes. Click "Save Script" to persist your modifications.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saveScript.isPending}
            >
              {saveScript.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Script
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Download the Script</h4>
            <p className="text-sm text-muted-foreground">
              Click the "Download" button above to save <code className="rounded bg-muted px-1 py-0.5">install_vpn_dashboard.sh</code> to your local machine.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Upload to Server</h4>
            <p className="text-sm text-muted-foreground">
              Transfer the script to your Ubuntu 26.04 server:
            </p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
              <code>scp install_vpn_dashboard.sh ubuntu@your-server-ip:/home/ubuntu/</code>
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Prepare Project Files</h4>
            <p className="text-sm text-muted-foreground">
              Upload your project as either a ZIP file or directory:
            </p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
              <code>{`# Option 1: Upload ZIP file
scp vpn-dashboard.zip ubuntu@your-server-ip:/home/ubuntu/

# Option 2: Upload directory
scp -r vpn-dashboard/ ubuntu@your-server-ip:/home/ubuntu/`}</code>
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">4. Run the Installation</h4>
            <p className="text-sm text-muted-foreground">
              SSH into your server and execute the script:
            </p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
              <code>{`ssh ubuntu@your-server-ip
chmod +x install_vpn_dashboard.sh
sudo ./install_vpn_dashboard.sh`}</code>
            </pre>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">5. Post-Installation</h4>
            <p className="text-sm text-muted-foreground">
              After successful installation:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Access the dashboard at the URL displayed in the script output</li>
              <li>Login with Internet Identity</li>
              <li>Navigate to Settings and add your Proton VPN Pro credentials</li>
              <li>Start managing your WireGuard VPN server</li>
            </ul>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> The script must be run with sudo/root privileges. It will modify system packages and configurations.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What the Script Does</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="font-medium text-primary">1.</span>
              <span>Updates and upgrades system packages</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">2.</span>
              <span>Installs base dependencies (curl, git, build-essential, unzip)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">3.</span>
              <span>Installs dfx (Internet Computer SDK) and configures PATH</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">4.</span>
              <span>Installs and enables Docker service</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">5.</span>
              <span>Installs WireGuard and loads kernel module</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">6.</span>
              <span>Creates deployment directory at /opt/vpn-dashboard</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">7.</span>
              <span>Extracts project files from ZIP or copies from directory</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">8.</span>
              <span>Runs dfx deploy to build and start the application</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">9.</span>
              <span>Creates systemd service for auto-start on boot</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
