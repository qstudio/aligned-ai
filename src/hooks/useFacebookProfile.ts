
import { useState, useCallback, useEffect } from "react";
import { extractProfileData } from "@/services/facebook/profileExtractor";

export const useFacebookProfile = () => {
  const [profileData, setProfileData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Try to load cached profile data from localStorage on mount
  useEffect(() => {
    const cachedData = localStorage.getItem("facebook_profile_data");
    const cachedTimestamp = localStorage.getItem("facebook_profile_timestamp");
    
    if (cachedData && cachedTimestamp) {
      // Only use cached data if it's less than 24 hours old
      const now = new Date().getTime();
      const timestamp = parseInt(cachedTimestamp, 10);
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (now - timestamp < oneDay) {
        try {
          setProfileData(JSON.parse(cachedData));
        } catch (e) {
          console.error("Failed to parse cached profile data", e);
          localStorage.removeItem("facebook_profile_data");
          localStorage.removeItem("facebook_profile_timestamp");
        }
      } else {
        // Clear expired cache
        localStorage.removeItem("facebook_profile_data");
        localStorage.removeItem("facebook_profile_timestamp");
      }
    }
  }, []);
  
  const scanProfile = useCallback(async (profileUrl: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Extract data from the profile
      const data = await extractProfileData(profileUrl);
      
      if (data) {
        setProfileData(data);
        
        // Cache the profile data in localStorage with timestamp
        localStorage.setItem("facebook_profile_data", JSON.stringify(data));
        localStorage.setItem("facebook_profile_timestamp", new Date().getTime().toString());
      } else {
        setError("Failed to extract profile data");
      }
    } catch (err) {
      console.error("Error scanning Facebook profile:", err);
      setError("Error scanning profile. Make sure the URL is correct and the profile is public.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const clearProfile = useCallback(() => {
    setProfileData(null);
    setError(null);
    localStorage.removeItem("facebook_profile_data");
    localStorage.removeItem("facebook_profile_timestamp");
  }, []);
  
  return {
    profileData,
    isLoading,
    error,
    scanProfile,
    clearProfile
  };
};
