import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  service: string;
  lastUsed: string;
}

const apiKeys: ApiKey[] = [
  {
    id: "1",
    name: "OpenAI Production",
    key: "sk-...3jk9",
    service: "OpenAI",
    lastUsed: "2024-03-15"
  },
  {
    id: "2",
    name: "Anthropic Dev",
    key: "sk-...9f3k",
    service: "Anthropic",
    lastUsed: "2024-03-12"
  }
];

function ApiKeyCard({ apiKey }: { apiKey: ApiKey }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{apiKey.name}</CardTitle>
            <CardDescription className="mt-1">
              Last used: {apiKey.lastUsed}
            </CardDescription>
          </div>
          <Badge className="w-fit">{apiKey.service}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input 
            type="password" 
            value={apiKey.key} 
            readOnly 
            className="font-mono flex-1"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              Copy
            </Button>
            <Button variant="destructive" size="sm" className="flex-1 sm:flex-none">
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ApiKeysPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🔑 API Keys</CardTitle>
        <CardDescription>Manage your API integrations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add New API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="e.g., OpenAI Production" />
            </div>
            <div>
              <label className="text-sm font-medium">Service</label>
              <Input placeholder="e.g., OpenAI" />
            </div>
            <div>
              <label className="text-sm font-medium">API Key</label>
              <Input type="password" placeholder="Enter your API key" />
            </div>
            <Button className="w-full">Add API Key</Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {apiKeys.map((apiKey) => (
            <ApiKeyCard key={apiKey.id} apiKey={apiKey} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
