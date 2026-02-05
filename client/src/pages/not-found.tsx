import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-xl border-0">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-red-500 font-bold text-2xl items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h1>404 Page Not Found</h1>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-6">
              The page you are looking for does not exist or has been moved.
            </p>
            <Link href="/">
              <Button className="w-full bg-primary hover:bg-primary/90">Return to Dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
