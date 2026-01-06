import { useState } from 'react';
import { useAddWireGuardPeer } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { WireGuardPeer } from '../backend';

interface AddPeerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddPeerDialog({ open, onOpenChange }: AddPeerDialogProps) {
  const [peerId, setPeerId] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [allowedIps, setAllowedIps] = useState('10.0.0.2/32');
  const { mutate: addPeer, isPending } = useAddWireGuardPeer();

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let key = '';
    for (let i = 0; i < 44; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const peer: WireGuardPeer = {
      id: peerId,
      publicKey: publicKey || generateRandomKey(),
      allowedIps,
      createdAt: BigInt(Date.now() * 1000000),
      lastSeen: undefined,
      dataUsage: BigInt(0),
    };

    addPeer(peer, {
      onSuccess: () => {
        setPeerId('');
        setPublicKey('');
        setAllowedIps('10.0.0.2/32');
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Peer</DialogTitle>
          <DialogDescription>
            Create a new WireGuard peer configuration. A public key will be generated if not provided.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="peerId">Peer ID *</Label>
            <Input
              id="peerId"
              placeholder="e.g., client-laptop"
              value={peerId}
              onChange={(e) => setPeerId(e.target.value)}
              disabled={isPending}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="publicKey">Public Key (optional)</Label>
            <Input
              id="publicKey"
              placeholder="Leave empty to auto-generate"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              disabled={isPending}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allowedIps">Allowed IPs *</Label>
            <Input
              id="allowedIps"
              placeholder="10.0.0.2/32"
              value={allowedIps}
              onChange={(e) => setAllowedIps(e.target.value)}
              disabled={isPending}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!peerId || !allowedIps || isPending}>
              {isPending ? 'Adding...' : 'Add Peer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
