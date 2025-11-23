import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

interface LiveDemoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LiveDemoModal({ open, onOpenChange }: LiveDemoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow to-blue bg-clip-text text-transparent">
            Try AgentForms Live Demo
          </DialogTitle>
          <DialogDescription className="text-base">
            Experience how AI-powered conversational forms work in real-time
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="bg-card-secondary rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold mb-3">What you'll see:</h3>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>AI agent asking intelligent questions</li>
              <li>Real-time validation and feedback</li>
              <li>Natural conversation flow</li>
              <li>Structured data collection</li>
            </ul>
          </div>

          <div className="bg-card-secondary rounded-xl p-6 border border-border">
            <p className="text-muted-foreground mb-4">
              The demo will open in a new window where you can interact with a sample agent.
            </p>
            <div className="flex gap-4">
              <Button
                asChild
                className="bg-yellow text-background hover:bg-yellow/90"
                onClick={() => onOpenChange(false)}
              >
                <Link to="/a/demo" target="_blank">
                  Open Live Demo
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
