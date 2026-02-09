import { useState, useEffect } from "react";
import { QrCode, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Html5Qrcode } from "html5-qrcode";
import { useScanRfid } from "@/hooks/use-visits";
import { motion, AnimatePresence } from "framer-motion";

export default function ScanQR() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{success: boolean, message: string} | null>(null);
  const scanMutation = useScanRfid();

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (isScanning && !scanResult) {
      // Small delay to ensure the DOM element is rendered before starting the scanner
      const timer = setTimeout(() => {
        const element = document.getElementById("reader");
        if (element) {
          html5QrCode = new Html5Qrcode("reader");
          const config = { fps: 10, qrbox: { width: 250, height: 250 } };

          html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              handleScan(decodedText);
              if (html5QrCode) {
                html5QrCode.stop().catch(console.error);
                setIsScanning(false);
              }
            },
            () => {} 
          ).catch((err) => {
            console.error("Error starting QR scanner:", err);
            setIsScanning(false);
          });
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().catch(console.error);
        }
      };
    }
  }, [isScanning, scanResult]);

  const handleScan = (data: string) => {
    scanMutation.mutate(data, {
      onSuccess: (res) => {
        setScanResult({ success: true, message: res.message });
        setTimeout(() => setScanResult(null), 3000);
      },
      onError: (err) => {
        setScanResult({ success: false, message: err.message });
        setTimeout(() => setScanResult(null), 3000);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
       <div className="mb-10">
        <h2 className="text-3xl font-display font-bold text-gray-900">Scan QR Code</h2>
        <p className="text-gray-500 mt-2">Pindai kode QR pada kartu pengunjung untuk check-out cepat</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <Card className="p-8 bg-black/5 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
           <AnimatePresence mode="wait">
             {scanResult ? (
               <motion.div
                 key="result"
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0.8, opacity: 0 }}
                 className="flex flex-col items-center text-center z-10"
               >
                 {scanResult.success ? (
                   <div className="bg-green-100 p-6 rounded-full mb-6">
                     <CheckCircle2 className="h-20 w-20 text-green-600" />
                   </div>
                 ) : (
                   <div className="bg-red-100 p-6 rounded-full mb-6">
                     <AlertCircle className="h-20 w-20 text-red-600" />
                   </div>
                 )}
                 <h3 className={`text-2xl font-bold mb-2 ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
                   {scanResult.success ? 'Berhasil' : 'Gagal'}
                 </h3>
                 <p className="text-gray-600 text-lg">{scanResult.message}</p>
               </motion.div>
             ) : isScanning ? (
               <div id="reader" className="w-full h-full min-h-[300px]" />
             ) : (
               <motion.div 
                 key="idle"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex flex-col items-center"
               >
                 <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                   <QrCode className="h-32 w-32 text-gray-400" />
                 </div>
                 <p className="text-gray-500 font-medium">Klik tombol di bawah untuk mulai kamera</p>
                 <Button 
                   onClick={() => setIsScanning(true)}
                   className="mt-6 bg-primary hover:bg-primary/90 rounded-full px-8"
                   disabled={scanMutation.isPending}
                 >
                   {scanMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   Mulai Kamera
                 </Button>
               </motion.div>
             )}
           </AnimatePresence>
        </Card>

        <div className="text-left space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-lg mb-2 text-gray-900">Petunjuk</h3>
             <ul className="space-y-3 text-gray-600">
               <li className="flex gap-3 items-start">
                 <span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs mt-0.5">1</span>
                 Pastikan kode QR pada kartu terlihat jelas.
               </li>
               <li className="flex gap-3 items-start">
                 <span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs mt-0.5">2</span>
                 Arahkan kode QR ke depan kamera.
               </li>
               <li className="flex gap-3 items-start">
                 <span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs mt-0.5">3</span>
                 Sistem akan otomatis melakukan check-out setelah pemindaian berhasil.
               </li>
             </ul>
           </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-800">
              <p className="text-sm font-medium mb-3">
                Catatan: Fitur ini memerlukan izin kamera. Jika kamera tidak muncul, periksa pengaturan browser Anda.
              </p>
              <div className="text-xs space-y-1">
                <p className="font-bold">Tips Akses HTTP:</p>
                <p>1. Gunakan <b>localhost</b> atau <b>127.0.0.1</b></p>
                <p>2. Jika via Replit, pastikan menggunakan <b>https://</b></p>
                <p>3. Chrome Flags: <code className="bg-blue-100 px-1 rounded">chrome://flags/#unsafely-treat-insecure-origin-as-secure</code></p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
