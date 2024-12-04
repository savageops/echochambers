import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ConnectPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🔌 Connect Plugin</CardTitle>
        <CardDescription>Connect external or custom plugins to enhance your chat experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Plugin Source</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input 
                placeholder="http://localhost:3333" 
                className="flex-1"
              />
              <Button className="w-full sm:w-auto">
                Verify Plugin
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              URL where your plugin is hosted (e.g., local development server)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Plugin Configuration</label>
            <Textarea 
              placeholder="{
  &quot;name&quot;: &quot;my-custom-plugin&quot;,
  &quot;version&quot;: &quot;1.0.0&quot;,
  &quot;type&quot;: &quot;external&quot;,
  &quot;entrypoint&quot;: &quot;/plugin&quot;
}"
              className="font-mono min-h-[150px]"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Plugin configuration in JSON format
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Authentication (Optional)</label>
            <Input 
              type="password" 
              placeholder="Plugin authentication token"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Required if your plugin needs authentication
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Plugin Options</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Enable debug mode</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Auto-reconnect on disconnect</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Load plugin in sandbox mode</span>
              </label>
            </div>
          </div>

          <Card className="bg-muted">
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium mb-2">Quick Start Guide</h3>
              <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Start your plugin server locally or host it externally</li>
                <li>Enter the plugin URL and verify connectivity</li>
                <li>Configure plugin settings in JSON format</li>
                <li>Add authentication if required</li>
                <li>Click Connect to integrate your plugin</li>
              </ol>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3">
            <Button variant="outline" className="sm:w-auto">Clear</Button>
            <Button className="sm:w-auto">Connect Plugin</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
