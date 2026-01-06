import { useGetWireGuardPeers } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Copy, QrCode as QrCodeIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef, useState } from 'react';

interface PeerConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peerId: string;
}

declare global {
  interface Window {
    QRCode: any;
  }
}

export default function PeerConfigDialog({ open, onOpenChange, peerId }: PeerConfigDialogProps) {
  const { data: peers } = useGetWireGuardPeers();
  const [qrCodeLoaded, setQrCodeLoaded] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  
  const peer = peers?.find((p) => p.id === peerId);

  const config = peer
    ? `[Interface]
PrivateKey = <CLIENT_PRIVATE_KEY>
Address = ${peer.allowedIps}
DNS = 1.1.1.1

[Peer]
PublicKey = ${peer.publicKey}
Endpoint = <SERVER_IP>:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`
    : '';

  // Load QRCode library from CDN
  useEffect(() => {
    if (window.QRCode) {
      setQrCodeLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
    script.async = true;
    script.onload = () => setQrCodeLoaded(true);
    script.onerror = () => {
      console.error('Failed to load QRCode library');
      setQrCodeLoaded(false);
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Generate QR code when dialog opens and library is loaded
  useEffect(() => {
    if (open && qrCodeLoaded && config && qrContainerRef.current && window.QRCode) {
      // Clear previous QR code
      qrContainerRef.current.innerHTML = '';
      
      try {
        new window.QRCode(qrContainerRef.current, {
          text: config,
          width: 300,
          height: 300,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel?.M || 2,
        });
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    }
  }, [open, qrCodeLoaded, config]);

  const handleCopy = () => {
    navigator.clipboard.writeText(config);
    toast.success('Configuration copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${peerId}.conf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Configuration file downloaded');
  };

  if (!peer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Peer Configuration: {peerId}</DialogTitle>
          <DialogDescription>
            Download or scan the QR code to configure the WireGuard client
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <pre className="overflow-x-auto text-xs">
                <code>{config}</code>
              </pre>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download .conf
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              {qrCodeLoaded ? (
                <>
                  <div 
                    ref={qrContainerRef} 
                    className="rounded-lg border bg-white p-4"
                  />
                  <p className="text-sm text-muted-foreground">
                    Scan with WireGuard mobile app
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <QrCodeIcon className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading QR code generator...</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
