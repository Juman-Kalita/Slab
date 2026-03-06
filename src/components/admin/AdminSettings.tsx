import { useState } from "react";
import { changeAdminPassword, getCurrentUser } from "@/lib/auth-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Shield, User, Edit2 } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const user = getCurrentUser();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(user?.fullName || "");
  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [profileLoading, setProfileLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const result = await changeAdminPassword(currentPassword, newPassword);
    setLoading(false);

    if (result.success) {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(result.error || "Failed to change password");
    }
  };

  const handleUpdateProfile = async () => {
    if (!editFullName.trim() || !editUsername.trim()) {
      toast.error("Name and username cannot be empty");
      return;
    }

    if (editUsername.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    setProfileLoading(true);
    
    // Import updateAdminProfile dynamically
    const { updateAdminProfile } = await import("@/lib/auth-service");
    const result = await updateAdminProfile({
      fullName: editFullName,
      username: editUsername
    });
    
    setProfileLoading(false);

    if (result.success) {
      toast.success("Profile updated successfully");
      setIsEditingProfile(false);
      // Reload page to update session
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    setEditFullName(user?.fullName || "");
    setEditUsername(user?.username || "");
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
          <CardDescription>Manage your admin account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{user?.fullName}</div>
              <div className="text-sm text-muted-foreground">@{user?.username}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            </div>
            {!isEditingProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(true)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isEditingProfile && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Edit Profile</CardTitle>
            </div>
            <CardDescription>Update your name and username</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFullName">Full Name</Label>
              <Input
                id="editFullName"
                type="text"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editUsername">Username</Label>
              <Input
                id="editUsername"
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Enter username"
              />
              <p className="text-xs text-muted-foreground">
                Username must be at least 3 characters
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateProfile} disabled={profileLoading}>
                {profileLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} disabled={profileLoading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            <CardTitle>Change Password</CardTitle>
          </div>
          <CardDescription>Update your admin password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <Button onClick={handleChangePassword} disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
