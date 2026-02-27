import { Copyright } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2 text-gray-500 text-sm">
        <Copyright className="h-4 w-4" />
        <span>WIS 2025</span>
      </div>
    </footer>
  );
}
