import { useState } from 'react';
import Header from '../components/Header';
import ServerStatusCard from '../components/ServerStatusCard';
import PeersTable from '../components/PeersTable';
import ProtonVpnSettings from '../components/ProtonVpnSettings';
import DeploymentGuide from '../components/DeploymentGuide';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Server, Users, Settings, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">VPN Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your WireGuard VPN server and monitor connections
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <Server className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="peers" className="gap-2">
              <Users className="h-4 w-4" />
              Peers
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="deployment" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Deployment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ServerStatusCard />
          </TabsContent>

          <TabsContent value="peers" className="space-y-6">
            <PeersTable />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <ProtonVpnSettings />
          </TabsContent>

          <TabsContent value="deployment" className="space-y-6">
            <DeploymentGuide />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border/40 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025. Built with <span className="text-destructive">♥</span> using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
