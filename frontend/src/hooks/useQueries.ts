import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { WireGuardPeer, ProtonVpnCredentials, ServerStatus, UserProfile, InstallationScript, DeploymentGuide, FreelancerDeploymentGuide, FinalDeploymentDocument } from '../backend';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useGetWireGuardPeers() {
  const { actor, isFetching } = useActor();

  return useQuery<WireGuardPeer[]>({
    queryKey: ['wireGuardPeers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWireGuardPeers();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useAddWireGuardPeer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (peer: WireGuardPeer) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addWireGuardPeer(peer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireGuardPeers'] });
      queryClient.invalidateQueries({ queryKey: ['serverStatus'] });
      toast.success('Peer added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add peer: ${error.message}`);
    },
  });
}

export function useRemoveWireGuardPeer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (peerId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeWireGuardPeer(peerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wireGuardPeers'] });
      queryClient.invalidateQueries({ queryKey: ['serverStatus'] });
      toast.success('Peer removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove peer: ${error.message}`);
    },
  });
}

export function useGetServerStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<ServerStatus>({
    queryKey: ['serverStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getServerStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useStartWireGuardService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.startWireGuardService();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverStatus'] });
      toast.success('VPN service started');
    },
    onError: (error: Error) => {
      toast.error(`Failed to start service: ${error.message}`);
    },
  });
}

export function useStopWireGuardService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.stopWireGuardService();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverStatus'] });
      toast.success('VPN service stopped');
    },
    onError: (error: Error) => {
      toast.error(`Failed to stop service: ${error.message}`);
    },
  });
}

export function useRestartWireGuardService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.restartWireGuardService();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverStatus'] });
      toast.success('VPN service restarted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to restart service: ${error.message}`);
    },
  });
}

export function useGetProtonVpnCredentials() {
  const { actor, isFetching } = useActor();

  return useQuery<ProtonVpnCredentials | null>({
    queryKey: ['protonVpnCredentials'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProtonVpnCredentials();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProtonVpnCredentials() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: ProtonVpnCredentials) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveProtonVpnCredentials(credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protonVpnCredentials'] });
      toast.success('Proton VPN credentials saved');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save credentials: ${error.message}`);
    },
  });
}

export function useFetchProtonVpnServers() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.fetchProtonVpnServers();
    },
    onSuccess: () => {
      toast.success('Proton VPN servers fetched successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to fetch servers: ${error.message}`);
    },
  });
}

export function useGetInstallationScript() {
  const { actor, isFetching } = useActor();

  return useQuery<InstallationScript | null>({
    queryKey: ['installationScript'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getInstallationScript();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveInstallationScript() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (script: InstallationScript) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveInstallationScript(script);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installationScript'] });
      toast.success('Installation script saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save installation script: ${error.message}`);
    },
  });
}

export function useGetDeploymentGuide() {
  const { actor, isFetching } = useActor();

  return useQuery<DeploymentGuide | null>({
    queryKey: ['deploymentGuide'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDeploymentGuide();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveDeploymentGuide() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guide: DeploymentGuide) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveDeploymentGuide(guide);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deploymentGuide'] });
      toast.success('Deployment guide saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save deployment guide: ${error.message}`);
    },
  });
}

export function useGetFreelancerDeploymentGuide() {
  const { actor, isFetching } = useActor();

  return useQuery<FreelancerDeploymentGuide | null>({
    queryKey: ['freelancerDeploymentGuide'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getFreelancerDeploymentGuide();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveFreelancerDeploymentGuide() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (guide: FreelancerDeploymentGuide) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveFreelancerDeploymentGuide(guide);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freelancerDeploymentGuide'] });
      toast.success('Freelancer deployment guide saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save freelancer deployment guide: ${error.message}`);
    },
  });
}

export function useGetFinalDeploymentDocument() {
  const { actor, isFetching } = useActor();

  return useQuery<FinalDeploymentDocument | null>({
    queryKey: ['finalDeploymentDocument'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getFinalDeploymentDocument();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveFinalDeploymentDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (document: FinalDeploymentDocument) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveFinalDeploymentDocument(document);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finalDeploymentDocument'] });
      toast.success('Final deployment document saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save final deployment document: ${error.message}`);
    },
  });
}
