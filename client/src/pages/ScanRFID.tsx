import { useState, useEffect } from "react";
import { useScanRfid } from "@/hooks/use-visits";
import { ScanLine, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export default function ScanRFID() {
  const [rfidInput, setRfidInput] = useState("");
  const scanMutation = useScanRfid();
  const [scanResult, setScanResult] = useState<{success: boolean, message: string} | null>(null);

  // Auto-focus input and simulate scanner behavior
  useEffect(() => {
    const timer = setTimeout(() => {
      document.getElementById("rfid-input")?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [scanResult]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidInput.trim()) return;

    scanMutation.mutate(rfidInput, {
      onSuccess: (data) => {
        setScanResult({ success: true, message: data.message });
        setRfidInput("");
        // Reset after 3 seconds
        setTimeout(() => setScanResult(null), 3000);
      },
      onError: (error) => {
        setScanResult({ success: false, message: error.message });
        setRfidInput("");
        setTimeout(() => setScanResult(null), 3000);
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-bold text-gray-900">Scan RFID Card</h2>
        <p className="text-gray-500 mt-2">Tap card on the reader or enter ID manually</p>
      </div>

      <div className="relative">
        <Card className="bg-white border-0 shadow-xl rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px] overflow-hidden relative">
          
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
                   {scanResult.success ? 'Access Granted' : 'Access Denied'}
                 </h3>
                 <p className="text-gray-600 text-lg">{scanResult.message}</p>
               </motion.div>
            ) : (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center z-10"
              >
                 {scanMutation.isPending ? (
                   <div className="relative">
                     <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                     <div className="bg-white p-6 rounded-full relative z-10 shadow-lg border-4 border-primary">
                       <Loader2 className="h-20 w-20 text-primary animate-spin" />
                     </div>
                   </div>
                 ) : (
                   <>
                     <div className="relative mb-8 group cursor-pointer" onClick={() => document.getElementById("rfid-input")?.focus()}>
                        <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse group-hover:bg-primary/10 transition-colors" />
                        <div className="bg-white p-8 rounded-full relative z-10 shadow-lg border border-gray-100 group-hover:scale-105 transition-transform duration-300">
                          <ScanLine className="h-24 w-24 text-primary" />
                        </div>
                     </div>
                     <p className="text-lg font-medium text-gray-900 animate-pulse">Waiting for scan...</p>
                   </>
                 )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hidden Input for scanner focus */}
          <form onSubmit={handleScan} className="opacity-0 absolute inset-0 pointer-events-none">
             <input 
                id="rfid-input"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                autoFocus
                autoComplete="off"
             />
             <button type="submit" />
          </form>

          {/* Decorative background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)] pointer-events-none" />
        </Card>

        {/* Manual Input Fallback */}
        <div className="mt-8 max-w-sm mx-auto">
          <form onSubmit={handleScan} className="flex gap-2">
            <Input 
               placeholder="Manual Entry (Press Enter)" 
               value={rfidInput}
               onChange={(e) => setRfidInput(e.target.value)}
               className="bg-white shadow-sm border-gray-200 focus:ring-primary rounded-xl"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
