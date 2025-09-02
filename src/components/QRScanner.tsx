import { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScanResult: (result: string) => void;
  trigger?: React.ReactNode;
  scanType?: 'qr' | 'barcode';
}

const QRScanner = ({ onScanResult, trigger, scanType = 'qr' }: QRScannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          onScanResult(result.data);
          stopScanning();
          setIsOpen(false);
          toast({
            title: "掃描成功",
            description: "已成功讀取 QR Code",
          });
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment'
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast({
        title: "錯誤",
        description: "無法啟動相機，請檢查權限設定",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTimeout(startScanning, 100);
    } else {
      stopScanning();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            掃描 QR Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            掃描 QR Code
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2" />
                  <p>準備掃描...</p>
                </div>
              </div>
            )}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            將 QR Code 對準相機畫面進行掃描
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { QRScanner };