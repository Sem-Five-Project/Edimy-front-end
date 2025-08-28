import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-lg dark:bg-gray-900/80">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
            Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="text-6xl font-bold text-gray-300 dark:text-gray-600">404</div>
          <p className="text-gray-600 dark:text-gray-400">
            The page you're looking for doesn't exist or you don't have permission to access it.
          </p>
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200">
              Go Back Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}