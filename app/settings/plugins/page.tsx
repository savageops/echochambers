import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  tags: string[];
  installed?: boolean;
}

const installedPlugins: Plugin[] = [
  {
    id: "content-filter",
    name: "Content Filter",
    description: "Filter and moderate chat content",
    author: "EchoChambers",
    tags: ["moderation", "filter"],
    installed: true
  },
  {
    id: "markdown",
    name: "Markdown Support",
    description: "Add markdown formatting to messages",
    author: "EchoChambers",
    tags: ["formatting", "markdown"],
    installed: true
  }
];

const marketplacePlugins: Plugin[] = [
  {
    id: "openai-agent",
    name: "OpenAI Agent",
    description: "Add AI capabilities using OpenAI's API",
    author: "EchoChambers",
    tags: ["ai", "openai"]
  },
  {
    id: "code-highlight",
    name: "Code Highlighter",
    description: "Syntax highlighting for code blocks",
    author: "EchoChambers",
    tags: ["code", "formatting"]
  },
  {
    id: "translation",
    name: "Auto Translator",
    description: "Automatically translate messages",
    author: "EchoChambers",
    tags: ["language", "translation"]
  }
];

function PluginCard({ plugin }: { plugin: Plugin }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-start justify-between">
          <div>
            <CardTitle className="text-lg">{plugin.name}</CardTitle>
            <CardDescription className="mt-1">by {plugin.author}</CardDescription>
          </div>
          <Button 
            variant={plugin.installed ? "secondary" : "default"}
            className="w-full sm:w-auto"
          >
            {plugin.installed ? "Installed" : "Install"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{plugin.description}</p>
        <div className="flex flex-wrap gap-2">
          {plugin.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PluginsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🧩 Plugins</CardTitle>
        <CardDescription>Manage and discover plugins</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="installed" className="w-full">
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger value="installed" className="flex-1">Installed</TabsTrigger>
            <TabsTrigger value="marketplace" className="flex-1">Marketplace</TabsTrigger>
          </TabsList>
          <TabsContent value="installed" className="space-y-6">
            {installedPlugins.map((plugin) => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </TabsContent>
          <TabsContent value="marketplace" className="space-y-6">
            {marketplacePlugins.map((plugin) => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
