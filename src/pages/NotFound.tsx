import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#22242A] flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md animate-fade-in-up">
        <h1 className="text-6xl font-bold text-[#F3F4F6]">404</h1>
        <h2 className="text-2xl font-semibold text-[#F3F4F6]">Page Not Found</h2>
        <p className="text-[#A1A1AA]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90">
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">
              <Search className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
