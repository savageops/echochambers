"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const typescriptCode = `// Echo Chambers TypeScript/JavaScript Integration
import axios from 'axios';

interface TestRoom {
  id: string;
  name: string;
  agents: string[];
  metrics: string[];
}

async function createRoom(config: {
  name: string;
  agents: string[];
  metrics: string[];
}): Promise<TestRoom> {
  const response = await axios.post('/api/rooms', config);
  return response.data;
}

// Create a new testing room
const room = await createRoom({
  name: "Performance Testing",
  agents: ["gpt-4", "claude-2"],
  metrics: ["accuracy", "latency"],
});

// Add test scenarios
await axios.post(\`/api/rooms/\${room.id}/scenarios\`, {
  name: "Complex Reasoning",
  prompt: "Analyze the implications...",
  expectedOutcome: "Structured analysis...",
});

// Run tests and collect metrics
const results = await axios.post(\`/api/rooms/\${room.id}/run\`);
console.log(results.data.metrics);`;

const pythonCode = `# Echo Chambers Python Integration
import requests

def create_room(name: str, agents: list, metrics: list) -> dict:
    response = requests.post(
        "http://localhost:3000/api/rooms",
        json={
            "name": name,
            "agents": agents,
            "metrics": metrics
        }
    )
    return response.json()

# Create a new testing room
room = create_room(
    name="Performance Testing",
    agents=["gpt-4", "claude-2"],
    metrics=["accuracy", "latency"]
)

# Add test scenarios
requests.post(
    f"http://localhost:3000/api/rooms/{room['id']}/scenarios",
    json={
        "name": "Complex Reasoning",
        "prompt": "Analyze the implications...",
        "expectedOutcome": "Structured analysis..."
    }
)

# Run tests and collect metrics
results = requests.post(
    f"http://localhost:3000/api/rooms/{room['id']}/run"
)
print(results.json()["metrics"])`;

const rustCode = `// Echo Chambers Rust Integration
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct Room {
    id: String,
    name: String,
    agents: Vec<String>,
    metrics: Vec<String>,
}

#[derive(Debug, Serialize)]
struct RoomConfig {
    name: String,
    agents: Vec<String>,
    metrics: Vec<String>,
}

async fn create_room(config: RoomConfig) -> Result<Room, Box<dyn std::error::Error>> {
    let client = Client::new();
    let room = client
        .post("http://localhost:3000/api/rooms")
        .json(&config)
        .send()
        .await?
        .json::<Room>()
        .await?;

    Ok(room)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create a new testing room
    let room = create_room(RoomConfig {
        name: "Performance Testing".to_string(),
        agents: vec!["gpt-4".to_string(), "claude-2".to_string()],
        metrics: vec!["accuracy".to_string(), "latency".to_string()],
    })
    .await?;

    // Add test scenarios and run tests...
    Ok(())
}`;

const types = `interface TestRoom {
  id: string;
  name: string;
  agents: string[];
  metrics: string[];
  scenarios: TestScenario[];
}

interface TestScenario {
  id: string;
  name: string;
  prompt: string;
  expectedOutcome: string;
}

interface TestResult {
  roomId: string;
  metrics: Record<string, number>;
  model: string;
}`;

export default function CodeBlock() {
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const onCopy = (type: string) => {
    setCopied(type);
    if (type === "typescript") navigator.clipboard.writeText(typescriptCode);
    if (type === "python") navigator.clipboard.writeText(pythonCode);
    if (type === "rust") navigator.clipboard.writeText(rustCode);
    if (type === "types") navigator.clipboard.writeText(types);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/50 to-muted/0 backdrop-blur-sm shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative">
        <Tabs defaultValue="typescript" className="relative">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
            <TabsList className="h-9 bg-transparent p-0">
              {[
                ["typescript", "TypeScript"],
                ["python", "Python"],
                ["rust", "Rust"],
                ["types", "Types"],
              ].map(([value, label]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn(
                    "relative h-9 rounded-none border-b-2 border-b-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  )}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setExpanded(expanded ? null : "code")}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => onCopy(expanded || "typescript")}
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {["typescript", "python", "rust", "types"].map((type) => (
            <TabsContent
              key={type}
              value={type}
              className={cn(
                "border-none p-0 text-sm",
                expanded ? "max-h-[800px]" : "max-h-[400px]"
              )}
            >
              <div className="relative">
                <pre className="overflow-x-auto p-4 text-left">
                  <code className="relative text-muted-foreground">
                    {type === "typescript" && typescriptCode}
                    {type === "python" && pythonCode}
                    {type === "rust" && rustCode}
                    {type === "types" && types}
                  </code>
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </motion.div>
  );
}
