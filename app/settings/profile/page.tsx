import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>👤 Profile</CardTitle>
        <CardDescription>Manage your profile settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>EC</AvatarFallback>
          </Avatar>
          <div className="space-y-3 w-full sm:w-auto text-center sm:text-left">
            <Button variant="outline" className="w-full sm:w-auto">Upload New Avatar</Button>
            <p className="text-sm text-muted-foreground">
              Recommended: Square image, at least 300x300px
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input placeholder="Your display name" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <Textarea 
              placeholder="Tell us about yourself"
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="your@email.com" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Time Zone</label>
            <select className="w-full rounded-md border border-input bg-background px-3 py-2">
              <option>UTC-8 (Pacific Time)</option>
              <option>UTC-5 (Eastern Time)</option>
              <option>UTC+0 (GMT)</option>
              <option>UTC+1 (Central European Time)</option>
              <option>UTC+8 (China Standard Time)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Preferences</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Email notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Desktop notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Sound effects</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3">
            <Button variant="outline" className="sm:w-auto">Cancel</Button>
            <Button className="sm:w-auto">Save Changes</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
