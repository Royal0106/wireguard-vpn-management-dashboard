import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, Circle, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useActor } from '../hooks/useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { DetailedDeploymentChecklist, DetailedDeploymentStep } from '../backend';

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
        <code className="text-foreground">{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-1 top-1 h-6 w-6"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
    </div>
  );
}

interface StepItemProps {
  step: DetailedDeploymentStep;
  onToggle: () => void;
}

function StepItem({ step, onToggle }: StepItemProps) {
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id={step.title}
          checked={step.completed}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          <label
            htmlFor={step.title}
            className={`cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
              step.completed ? 'text-muted-foreground line-through' : ''
            }`}
          >
            {step.title}
          </label>
          <p className="text-sm text-muted-foreground">{step.description}</p>
          {step.commands.length > 0 && (
            <div className="space-y-2">
              {step.commands.map((cmd, idx) => (
                <CodeBlock key={idx} code={cmd} />
              ))}
            </div>
          )}
        </div>
        {step.completed && (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-500" />
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  steps: DetailedDeploymentStep[];
  onStepToggle: (index: number) => void;
  sectionKey: string;
}

function Section({ title, steps, onStepToggle, sectionKey }: SectionProps) {
  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const isComplete = completedCount === totalCount;

  return (
    <AccordionItem value={sectionKey}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3 text-left">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-500" />
          ) : (
            <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
          <div className="flex-1">
            <div className="font-semibold">{title}</div>
            <div className="text-xs text-muted-foreground">
              {completedCount} of {totalCount} steps completed
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 pt-2">
          {steps.map((step, idx) => (
            <StepItem key={idx} step={step} onToggle={() => onStepToggle(idx)} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function FreelancerDeploymentChecklist() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const { data: checklist, isLoading } = useQuery<DetailedDeploymentChecklist>({
    queryKey: ['detailedDeploymentChecklist'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDetailedDeploymentChecklist();
    },
    enabled: !!actor && !actorFetching,
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedChecklist: DetailedDeploymentChecklist) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDetailedDeploymentChecklist(updatedChecklist);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detailedDeploymentChecklist'] });
      queryClient.invalidateQueries({ queryKey: ['checklistProgress'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update checklist: ${error.message}`);
    },
  });

  const [localChecklist, setLocalChecklist] = useState<DetailedDeploymentChecklist | null>(null);

  useEffect(() => {
    if (checklist) {
      setLocalChecklist(checklist);
    }
  }, [checklist]);

  const handleStepToggle = (section: keyof DetailedDeploymentChecklist, stepIndex: number) => {
    if (!localChecklist) return;

    const updatedSection = [...localChecklist[section]];
    updatedSection[stepIndex] = {
      ...updatedSection[stepIndex],
      completed: !updatedSection[stepIndex].completed,
    };

    const updatedChecklist = {
      ...localChecklist,
      [section]: updatedSection,
    };

    setLocalChecklist(updatedChecklist);
    updateMutation.mutate(updatedChecklist);
  };

  const calculateProgress = () => {
    if (!localChecklist) return { completed: 0, total: 0, percentage: 0 };

    const allSteps = [
      ...localChecklist.serverPreparation,
      ...localChecklist.appDeployment,
      ...localChecklist.wireGuardConfigGeneration,
      ...localChecklist.protonVpnIntegration,
      ...localChecklist.verificationMonitoring,
    ];

    const completed = allSteps.filter((s) => s.completed).length;
    const total = allSteps.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  if (isLoading || !localChecklist) {
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

  const progress = calculateProgress();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Freelancer Deployment Checklist</CardTitle>
          <CardDescription>
            Step-by-step interactive checklist for deploying the WireGuard VPN dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This checklist covers all steps needed to deploy the VPN dashboard on Ubuntu 26.04.
              Check off each step as you complete it. Your progress is automatically saved.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {progress.completed} of {progress.total} steps completed
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="text-center text-2xl font-bold text-primary">
              {progress.percentage}%
            </div>
          </div>

          <Accordion type="multiple" defaultValue={['server', 'app']} className="space-y-2">
            <Section
              title="1. Server Preparation"
              steps={localChecklist.serverPreparation}
              onStepToggle={(idx) => handleStepToggle('serverPreparation', idx)}
              sectionKey="server"
            />

            <Section
              title="2. App Deployment"
              steps={localChecklist.appDeployment}
              onStepToggle={(idx) => handleStepToggle('appDeployment', idx)}
              sectionKey="app"
            />

            <Section
              title="3. WireGuard Configuration Generation"
              steps={localChecklist.wireGuardConfigGeneration}
              onStepToggle={(idx) => handleStepToggle('wireGuardConfigGeneration', idx)}
              sectionKey="wireguard"
            />

            <Section
              title="4. Proton VPN Pro Integration"
              steps={localChecklist.protonVpnIntegration}
              onStepToggle={(idx) => handleStepToggle('protonVpnIntegration', idx)}
              sectionKey="proton"
            />

            <Section
              title="5. Verification & Monitoring"
              steps={localChecklist.verificationMonitoring}
              onStepToggle={(idx) => handleStepToggle('verificationMonitoring', idx)}
              sectionKey="verification"
            />
          </Accordion>

          {progress.percentage === 100 && (
            <Alert className="border-green-600/20 bg-green-600/5">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
              <AlertDescription className="text-green-600 dark:text-green-500">
                Congratulations! You've completed all deployment steps. Your WireGuard VPN dashboard
                should now be fully operational.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Important Notes</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Replace <code className="rounded bg-muted px-1 py-0.5">&lt;server-ip&gt;</code> with your actual server IP address</li>
              <li>• Ensure you have sudo/root access on the Ubuntu 26.04 server</li>
              <li>• A Proton VPN Pro account is required (free accounts don't support WireGuard)</li>
              <li>• The deployment process typically takes 15-30 minutes</li>
              <li>• Keep your Internet Identity credentials secure for admin access</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Troubleshooting Tips</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• <strong>Firewall issues:</strong> Ensure ports 22 (SSH), 51820 (WireGuard), and 4943 (dfx) are open</li>
              <li>• <strong>Docker permissions:</strong> Log out and back in after adding user to docker group</li>
              <li>• <strong>DNS issues:</strong> Check <code className="rounded bg-muted px-1 py-0.5">/etc/resolv.conf</code> for proper DNS configuration</li>
              <li>• <strong>Key regeneration:</strong> If keys are corrupted, remove peer and recreate with new keys</li>
              <li>• <strong>Service restart:</strong> Use <code className="rounded bg-muted px-1 py-0.5">sudo systemctl restart wg-quick@wg0</code> to restart WireGuard</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">File Storage Locations</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• WireGuard configs: <code className="rounded bg-muted px-1 py-0.5">/etc/wireguard/</code></li>
              <li>• Project directory: <code className="rounded bg-muted px-1 py-0.5">/home/ubuntu/vpn-dashboard/</code></li>
              <li>• Client configs: Download from Peers tab, then zip and deliver to clients</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Dashboard Tabs Overview</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• <strong>Overview:</strong> Monitor VPN tunnel health and performance metrics</li>
              <li>• <strong>Peers:</strong> Create new server/client pairs, export .conf files and QR codes</li>
              <li>• <strong>Settings → Proton VPN:</strong> Enter credentials and select 10 Gbps servers near Raleigh, NC</li>
              <li>• <strong>Deployment:</strong> Access guides, scripts, and this checklist</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
