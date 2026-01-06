import { useState } from 'react';
import { useGetWireGuardPeers, useRemoveWireGuardPeer } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Download, QrCode } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AddPeerDialog from './AddPeerDialog';
import PeerConfigDialog from './PeerConfigDialog';

export default function PeersTable() {
  const { data: peers, isLoading } = useGetWireGuardPeers();
  const { mutate: removePeer, isPending: isRemoving } = useRemoveWireGuardPeer();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [peerToDelete, setPeerToDelete] = useState<string | null>(null);

  const handleRemovePeer = () => {
    if (peerToDelete) {
      removePeer(peerToDelete);
      setPeerToDelete(null);
    }
  };

  const handleShowConfig = (peerId: string) => {
    setSelectedPeer(peerId);
    setShowConfigDialog(true);
  };

  const formatDate = (timestamp: bigint | undefined) => {
    if (!timestamp) return 'Never';
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const formatBytes = (bytes: bigint) => {
    const mb = Number(bytes) / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>WireGuard Peers</CardTitle>
              <CardDescription>Manage VPN client configurations and access</CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Peer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!peers || peers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <QrCode className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No peers configured</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Add your first peer to start managing VPN connections
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Peer
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Public Key</TableHead>
                    <TableHead>Allowed IPs</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Seen</TableHead>
                    <TableHead>Data Usage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peers.map((peer) => (
                    <TableRow key={peer.id}>
                      <TableCell className="font-medium">{peer.id}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {peer.publicKey.slice(0, 16)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{peer.allowedIps}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(peer.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(peer.lastSeen)}
                      </TableCell>
                      <TableCell>{formatBytes(peer.dataUsage)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleShowConfig(peer.id)}
                            title="View configuration"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPeerToDelete(peer.id)}
                            disabled={isRemoving}
                            title="Remove peer"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddPeerDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      
      {selectedPeer && (
        <PeerConfigDialog
          open={showConfigDialog}
          onOpenChange={setShowConfigDialog}
          peerId={selectedPeer}
        />
      )}

      <AlertDialog open={!!peerToDelete} onOpenChange={() => setPeerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Peer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this peer? This action cannot be undone and the
              client will lose VPN access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemovePeer} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
