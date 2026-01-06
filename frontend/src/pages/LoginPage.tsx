import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Server, Lock, Activity } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-2xl bg-primary/10 p-4">
                <Shield className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h1 className="mb-4 text-5xl font-bold tracking-tight">
              WireGuard VPN Manager
            </h1>
            <p className="text-xl text-muted-foreground">
              Secure, Fast, and Powerful VPN Management Dashboard
            </p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <Server className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>10 Gbps Performance</CardTitle>
                <CardDescription>
                  High-speed VPN server with Proton VPN integration for optimal routing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <Lock className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Secure Management</CardTitle>
                <CardDescription>
                  Internet Identity authentication with encrypted credential storage
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <Activity className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>
                  Live connection tracking, data usage, and performance metrics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="mx-auto max-w-md border-primary/20 bg-card/80 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Admin Access</CardTitle>
              <CardDescription>
                Authenticate with Internet Identity to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={login}
                disabled={isLoggingIn}
                className="w-full"
                size="lg"
              >
                {isLoggingIn ? 'Authenticating...' : 'Login with Internet Identity'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Secure authentication powered by Internet Computer
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="border-t border-border/40 py-6">
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
