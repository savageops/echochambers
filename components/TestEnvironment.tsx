"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, X, UserPlus, Brain } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Agent {
  id: string;
  name: string;
  model: string;
  role: string;
  systemPrompt: string;
}

interface TestEnvironmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestEnvironment({ open, onOpenChange }: TestEnvironmentProps) {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);

  const handleAddAgent = () => {
    const newAgent: Agent = {
      id: Math.random().toString(36).substring(7),
      name: "",
      model: "gpt-4",
      role: "",
      systemPrompt: "",
    };
    setAgents([...agents, newAgent]);
  };

  const updateAgent = (id: string, field: keyof Agent, value: string) => {
    setAgents(agents.map(agent => 
      agent.id === id ? { ...agent, [field]: value } : agent
    ));
  };

  const removeAgent = (id: string) => {
    setAgents(agents.filter(agent => agent.id !== id));
  };

  const handleCreate = async () => {
    // Here you would implement the API call to create the room
    console.log({
      name: roomName,
      description: roomDescription,
      agents,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full md:w-[600px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b bg-card/50 backdrop-blur-sm">
            <SheetHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <SheetTitle>New Environment</SheetTitle>
                </div>
                <div className="w-9" /> {/* Spacer for alignment */}
              </div>
            </SheetHeader>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Room Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Room Name</Label>
                    <Input
                      placeholder="Enter room name..."
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Enter room description..."
                      value={roomDescription}
                      onChange={(e) => setRoomDescription(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Agents</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleAddAgent}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Agent
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {agents.map((agent) => (
                    <Card key={agent.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Brain className="h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Agent name"
                              value={agent.name}
                              onChange={(e) => updateAgent(agent.id, 'name', e.target.value)}
                              className="w-[200px]"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAgent(agent.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Model</Label>
                          <Select
                            value={agent.model}
                            onValueChange={(value) => updateAgent(agent.id, 'model', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gpt-4">GPT-4</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                              <SelectItem value="claude-2">Claude 2</SelectItem>
                              <SelectItem value="llama-2">Llama 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Input
                            placeholder="Agent's role (e.g., Interviewer, Assistant)"
                            value={agent.role}
                            onChange={(e) => updateAgent(agent.id, 'role', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>System Prompt</Label>
                          <Textarea
                            placeholder="Enter system prompt..."
                            value={agent.systemPrompt}
                            onChange={(e) => updateAgent(agent.id, 'systemPrompt', e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {agents.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <UserPlus className="h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-semibold">No agents added</h3>
                      <p className="text-sm text-muted-foreground">
                        Add agents to interact in this environment
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-card/50 backdrop-blur-sm">
            <Button 
              className="w-full" 
              onClick={handleCreate}
              disabled={!roomName || agents.length === 0}
            >
              Create Environment
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
