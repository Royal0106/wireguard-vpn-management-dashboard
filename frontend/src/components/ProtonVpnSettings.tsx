import { useState, useEffect } from 'react';
import { useGetProtonVpnCredentials, useSaveProtonVpnCredentials, useFetchProtonVpnServers } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProtonVpnSettings() {
  const { data: credentials, isLoading } = useGetProtonVpnCredentials();
  const { mutate: saveCredentials, isPending: isSaving } = useSaveProtonVpnCredentials();
  const { mutate: fetchServers, isPending: isFetching } = useFetchProtonVpnServers();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (credentials) {
      setUsername(credentials.username);
      setPassword(credentials.password);
    }
  }, [credentials]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCredentials({ username, password });
  };

  const handleFetchServers = () => {
    fetchServers();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Proton VPN Integration
          </CardTitle>
          <CardDescription>
            Configure Proton VPN Pro credentials for automatic server selection and routing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Proton VPN Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your Proton VPN username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Proton VPN Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your Proton VPN password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSaving}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" disabled={!username || !password || isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Credentials'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Server Selection</CardTitle>
          <CardDescription>
            Fetch and connect to optimal Proton VPN servers near Raleigh, NC
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              The system will automatically select low-load 10 Gbps WireGuard-capable servers
              near your configured location for optimal performance.
            </AlertDescription>
          </Alert>
          <Button
            onClick={handleFetchServers}
            disabled={!credentials || isFetching}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Fetching Servers...' : 'Fetch Available Servers'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connection Info</CardTitle>
          <CardDescription>Current Proton VPN tunnel configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Location:</span>
              <span className="font-medium">Raleigh, NC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Server Type:</span>
              <span className="font-medium">10 Gbps WireGuard</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Load Preference:</span>
              <span className="font-medium">Low Load</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
