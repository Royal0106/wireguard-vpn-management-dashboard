import { useGetServerStatus, useStartWireGuardService, useStopWireGuardService, useRestartWireGuardService } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, RotateCw, Activity, HardDrive, Cpu, Network, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ServerStatusCard() {
  const { data: status, isLoading } = useGetServerStatus();
  const { mutate: startService, isPending: isStarting } = useStartWireGuardService();
  const { mutate: stopService, isPending: isStopping } = useStopWireGuardService();
  const { mutate: restartService, isPending: isRestarting } = useRestartWireGuardService();

  const isOperating = isStarting || isStopping || isRestarting;

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

  const formatBytes = (bytes: bigint) => {
    const gb = Number(bytes) / (1024 * 1024 * 1024);
    return gb.toFixed(2) + ' GB';
  };

  const formatSpeed = (speed: bigint) => {
    const mbps = Number(speed) / (1024 * 1024);
    return mbps.toFixed(2) + ' Mbps';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Server Status
              </CardTitle>
              <CardDescription>WireGuard VPN service control and monitoring</CardDescription>
            </div>
            <Badge variant={status?.isRunning ? 'default' : 'secondary'} className="text-sm">
              {status?.isRunning ? 'Running' : 'Stopped'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => startService()}
              disabled={status?.isRunning || isOperating}
              size="sm"
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              {isStarting ? 'Starting...' : 'Start'}
            </Button>
            <Button
              onClick={() => stopService()}
              disabled={!status?.isRunning || isOperating}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              {isStopping ? 'Stopping...' : 'Stop'}
            </Button>
            <Button
              onClick={() => restartService()}
              disabled={!status?.isRunning || isOperating}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RotateCw className="h-4 w-4" />
              {isRestarting ? 'Restarting...' : 'Restart'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-primary" />
              Active Peers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.activePeers.toString() || '0'}</div>
            <p className="text-xs text-muted-foreground">Connected clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <HardDrive className="h-4 w-4 text-chart-1" />
              Data Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status ? formatBytes(status.totalDataUsage) : '0 GB'}
            </div>
            <p className="text-xs text-muted-foreground">Total transferred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Cpu className="h-4 w-4 text-chart-2" />
              CPU Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status?.cpuLoad.toString() || '0'}%</div>
            <p className="text-xs text-muted-foreground">System usage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Network className="h-4 w-4 text-chart-3" />
              Network Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {status ? formatSpeed(status.networkSpeed) : '0 Mbps'}
            </div>
            <p className="text-xs text-muted-foreground">Current throughput</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tunnel Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                status?.tunnelHealth === 'connected'
                  ? 'bg-chart-1'
                  : status?.tunnelHealth === 'restarting'
                  ? 'bg-chart-4'
                  : 'bg-muted'
              }`}
            />
            <span className="text-sm capitalize">{status?.tunnelHealth || 'Unknown'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
