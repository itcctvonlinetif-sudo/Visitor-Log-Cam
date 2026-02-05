import { QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ScanQR() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
       <div className="mb-10">
        <h2 className="text-3xl font-display font-bold text-gray-900">Scan QR Code</h2>
        <p className="text-gray-500 mt-2">Scan visitor pass for quick checkout</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <Card className="p-8 bg-black/5 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center min-h-[400px]">
           <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
             <QrCode className="h-32 w-32 text-gray-400" />
           </div>
           <p className="text-gray-500 font-medium">Camera Preview Area</p>
           <Button className="mt-6 bg-primary hover:bg-primary/90 rounded-full px-8">
             Start Camera
           </Button>
        </Card>

        <div className="text-left space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <h3 className="font-bold text-lg mb-2 text-gray-900">Instructions</h3>
             <ul className="space-y-3 text-gray-600">
               <li className="flex gap-3 items-start">
                 <span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs mt-0.5">1</span>
                 Ensure the visitor pass QR code is clearly visible.
               </li>
               <li className="flex gap-3 items-start">
                 <span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs mt-0.5">2</span>
                 Hold the pass steady in front of the camera.
               </li>
               <li className="flex gap-3 items-start">
                 <span className="bg-primary/10 text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs mt-0.5">3</span>
                 System will automatically checkout the visitor upon successful scan.
               </li>
             </ul>
           </div>

           <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-800">
              <p className="text-sm font-medium">
                Note: This feature requires camera permissions. If the camera doesn't start, check your browser settings.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
