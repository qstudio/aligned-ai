
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Facebook, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useFacebookProfile } from "@/hooks/useFacebookProfile";

export interface FacebookProfileInputProps {
  profileUrl?: string;
  setProfileUrl?: (url: string) => void;
  onProfileDataChange?: (profileData: any | null) => void;
}

export const FacebookProfileInput: React.FC<FacebookProfileInputProps> = ({ 
  profileUrl: externalProfileUrl,
  setProfileUrl: externalSetProfileUrl,
  onProfileDataChange 
}) => {
  const [profileUrl, setProfileUrl] = useState<string>(externalProfileUrl || "");
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [lastScannedUrl, setLastScannedUrl] = useState<string>("");
  const [hasNotifiedSuccess, setHasNotifiedSuccess] = useState<boolean>(false);
  
  const { 
    profileData, 
    isLoading, 
    error, 
    scanProfile, 
    clearProfile 
  } = useFacebookProfile();
  
  // Update internal state when external props change
  useEffect(() => {
    if (externalProfileUrl !== undefined) {
      setProfileUrl(externalProfileUrl);
    }
  }, [externalProfileUrl]);
  
  // Load saved preferences from localStorage
  useEffect(() => {
    const savedProfileUrl = localStorage.getItem("facebook_profile_url") || "";
    const savedIsEnabled = localStorage.getItem("facebook_profile_enabled") === "true";
    
    if (externalProfileUrl === undefined) { // Only set from localStorage if no external control
      setProfileUrl(savedProfileUrl);
    }
    setIsEnabled(savedIsEnabled);
    
    if (savedIsEnabled && (externalProfileUrl || savedProfileUrl)) {
      const urlToUse = externalProfileUrl || savedProfileUrl;
      setLastScannedUrl(urlToUse);
      scanProfile(urlToUse);
    }
  }, []);
  
  // Update preferences in localStorage when changed
  useEffect(() => {
    localStorage.setItem("facebook_profile_url", profileUrl);
    localStorage.setItem("facebook_profile_enabled", isEnabled.toString());
    
    // If external control is provided, update the parent
    if (externalSetProfileUrl) {
      externalSetProfileUrl(profileUrl);
    }
  }, [profileUrl, isEnabled, externalSetProfileUrl]);
  
  // Notify parent component when profile data changes
  useEffect(() => {
    if (isEnabled && profileData) {
      // Only call the callback if it exists
      if (onProfileDataChange) {
        onProfileDataChange(profileData);
      }
      
      // Only show success toast when profile data is first loaded or rescanned
      if (!hasNotifiedSuccess) {
        toast.success("Profile data updated", {
          description: `Using ${profileData.interests.length} interests to enhance your decisions`,
        });
        setHasNotifiedSuccess(true);
      }
    } else if (onProfileDataChange) {
      // Only call the callback if it exists
      onProfileDataChange(null);
    }
  }, [profileData, isEnabled, onProfileDataChange]);
  
  const handleScanProfile = () => {
    if (!profileUrl.trim()) {
      toast.error("Please enter a Facebook profile URL");
      return;
    }
    
    // Reset notification flag when scanning a new profile
    setHasNotifiedSuccess(false);
    setLastScannedUrl(profileUrl);
    scanProfile(profileUrl);
  };
  
  const handleToggleEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    
    if (!enabled) {
      clearProfile();
      setHasNotifiedSuccess(false);
      toast.info("Facebook profile integration has been disabled");
    } else if (profileUrl && (!profileData || lastScannedUrl !== profileUrl)) {
      setHasNotifiedSuccess(false);
      handleScanProfile();
    } else if (enabled && profileData) {
      // If re-enabling with existing data, don't show toast again
      setHasNotifiedSuccess(true);
    }
  };
  
  const handleReset = () => {
    setProfileUrl("");
    setIsEnabled(false);
    clearProfile();
    setHasNotifiedSuccess(false);
    localStorage.removeItem("facebook_profile_url");
    localStorage.removeItem("facebook_profile_enabled");
    
    // If external control is provided, update the parent
    if (externalSetProfileUrl) {
      externalSetProfileUrl("");
    }
    
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
