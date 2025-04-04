
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Facebook, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useFacebookProfile } from "@/hooks/useFacebookProfile";

export interface FacebookProfileInputProps {
  onProfileDataChange: (profileData: any | null) => void;
}

export const FacebookProfileInput: React.FC<FacebookProfileInputProps> = ({ 
  onProfileDataChange 
}) => {
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [lastScannedUrl, setLastScannedUrl] = useState<string>("");
  
  const { 
    profileData, 
    isLoading, 
    error, 
    scanProfile, 
    clearProfile 
  } = useFacebookProfile();
  
  // Load saved preferences from localStorage
  useEffect(() => {
    const savedProfileUrl = localStorage.getItem("facebook_profile_url") || "";
    const savedIsEnabled = localStorage.getItem("facebook_profile_enabled") === "true";
    
    setProfileUrl(savedProfileUrl);
    setIsEnabled(savedIsEnabled);
    
    if (savedIsEnabled && savedProfileUrl) {
      setLastScannedUrl(savedProfileUrl);
      scanProfile(savedProfileUrl);
    }
  }, []);
  
  // Update preferences in localStorage when changed
  useEffect(() => {
    localStorage.setItem("facebook_profile_url", profileUrl);
    localStorage.setItem("facebook_profile_enabled", isEnabled.toString());
  }, [profileUrl, isEnabled]);
  
  // Notify parent component when profile data changes
  useEffect(() => {
    if (isEnabled && profileData) {
      onProfileDataChange(profileData);
    } else {
      onProfileDataChange(null);
    }
  }, [profileData, isEnabled, onProfileDataChange]);
  
  const handleScanProfile = () => {
    if (!profileUrl.trim()) {
      toast.error("Please enter a Facebook profile URL");
      return;
    }
    
    setLastScannedUrl(profileUrl);
    scanProfile(profileUrl);
  };
  
  const handleToggleEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    
    if (!enabled) {
      clearProfile();
    } else if (profileUrl && (!profileData || lastScannedUrl !== profileUrl)) {
      handleScanProfile();
    }
  };
  
  const handleReset = () => {
    setProfileUrl("");
    setIsEnabled(false);
    clearProfile();
    localStorage.removeItem("facebook_profile_url");
    localStorage.removeItem("facebook_profile_enabled");
    toast.success("Facebook profile integration has been reset");
  };

  return (
    <div className="space-y-4 border rounded-md p-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Facebook className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-medium">Facebook Profile Integration</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Switch 
            id="facebook-enabled"
            checked={isEnabled}
            onCheckedChange={handleToggleEnabled}
          />
          <Label htmlFor="facebook-enabled">
            {isEnabled ? "Enabled" : "Disabled"}
          </Label>
        </div>
      </div>
      
      <div className={isEnabled ? "" : "opacity-50 pointer-events-none"}>
        <div className="flex gap-2">
          <Input
            placeholder="Enter your Facebook profile URL"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleScanProfile}
            variant="outline"
            disabled={isLoading || !profileUrl.trim()}
            size="sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              "Scan Profile"
            )}
          </Button>
        </div>
        
        {error && (
          <div className="text-sm text-red-500 flex items-center mt-2">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
        
        {profileData && (
          <div className="text-sm text-green-600 mt-2">
            Profile scanned successfully! Using data to enhance your decisions.
          </div>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p>Experimental: This feature extracts public information from your Facebook profile to personalize decision analysis.</p>
        <div className="flex mt-1">
          <Button 
            variant="link" 
            className="h-auto p-0 text-xs"
            onClick={handleReset}
          >
            Reset All Data
          </Button>
        </div>
      </div>
    </div>
  );
};
