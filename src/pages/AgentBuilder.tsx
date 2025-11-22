import { useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Play, Globe } from "lucide-react"

export default function AgentBuilder() {
  const { id } = useParams()
  const isNew = !id
  const [agentName, setAgentName] = useState("")
  const [description, setDescription] = useState("")

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F3F4F6]">
            {isNew ? "Create New Agent" : "Edit Agent"}
          </h1>
          <p className="text-[#A1A1AA] mt-1">
            {isNew ? "Build your conversational form agent" : "Update your agent configuration"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="outline">
            <Play className="mr-2 h-4 w-4" />
            Test
          </Button>
          <Button className="bg-[#F6D365] text-[#22242A] hover:bg-[#F6D365]/90">
            <Globe className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="fields" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="persona">Persona</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Details</CardTitle>
              <CardDescription>Basic information about your agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F3F4F6]">Agent Name</label>
                <Input
                  placeholder="Customer Support Bot"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#F3F4F6]">Description</label>
                <Input
                  placeholder="A helpful assistant for customer inquiries"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Form Fields</CardTitle>
              <CardDescription>Define the data you want to collect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[#A1A1AA] text-sm">
                Field editor will be implemented here. This will include:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Field type selection (text, email, number, etc.)</li>
                  <li>Validation rules</li>
                  <li>Required/optional toggle</li>
                  <li>Drag-and-drop reordering</li>
                </ul>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="persona">
          <Card>
            <CardHeader>
              <CardTitle>Persona & Tone</CardTitle>
              <CardDescription>Define how your agent communicates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[#A1A1AA] text-sm">
                Persona configuration will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Add context and information for your agent</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[#A1A1AA] text-sm">
                Knowledge base upload and configuration will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[#A1A1AA] text-sm">
                Appearance settings (colors, avatar, logo) will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
