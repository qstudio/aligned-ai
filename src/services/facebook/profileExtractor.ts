
import { toast } from "sonner";

export interface FacebookProfileData {
  name?: string;
  interests: string[];
  location?: string;
  education?: string[];
  work?: string[];
  bio?: string;
  lastUpdated: number; // timestamp
}

// Check if a URL looks like a Facebook profile URL
export const isValidFacebookProfileUrl = (url: string): boolean => {
  // Basic validation - could be enhanced
  return url.includes('facebook.com/') || url.includes('fb.com/');
};

// Extract public data from a Facebook profile (client-side approach)
export const extractProfileData = async (profileUrl: string): Promise<FacebookProfileData | null> => {
  if (!isValidFacebookProfileUrl(profileUrl)) {
    throw new Error("Invalid Facebook profile URL");
  }
  
  // In a real implementation, we would use an API or server-side approach
  // For this demo, we'll generate mock data based on the URL to simulate extraction
  
  try {
    // This simulates the network request to extract profile data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate deterministic mock data based on the profile URL
    // This ensures the same URL always produces the same mock data
    const hash = Array.from(profileUrl).reduce((acc, char) => {
      return (acc * 31 + char.charCodeAt(0)) % 1000000;
    }, 0);
    
    // Use the hash to determine mock interests
    const allInterests = [
      "Technology", "Cooking", "Travel", "Music", "Movies", "Books", "Sports", 
      "Photography", "Art", "Gaming", "Fitness", "Fashion", "Science", "Hiking", 
      "Programming", "Design", "Writing", "Crafts", "Gardening", "Meditation",
      "Finance", "Business", "History", "Philosophy", "Politics", "Environment",
      "Cycling", "Running", "Swimming", "Yoga"
    ];
    
    // Select interests based on the hash
    const numInterests = 3 + (hash % 5); // 3-7 interests
    const interests = [];
    let tempHash = hash;
    
    for (let i = 0; i < numInterests; i++) {
      const index = tempHash % allInterests.length;
      interests.push(allInterests[index]);
      tempHash = Math.floor(tempHash / 10);
    }
    
    // Use username from URL if possible
    const username = profileUrl.split('/').filter(Boolean).pop() || '';
    const name = username.charAt(0).toUpperCase() + username.slice(1).replace(/[0-9_-]/g, '');
    
    console.log(`Extracted mock profile data for: ${profileUrl}`);
    
    return {
      name: name || undefined,
      interests: [...new Set(interests)], // Remove duplicates
      location: (hash % 3 === 0) ? "San Francisco, CA" : undefined,
      bio: (hash % 5 === 0) ? "Passionate about technology and innovation" : undefined,
      education: (hash % 4 === 0) ? ["Computer Science"] : [],
      work: (hash % 7 === 0) ? ["Software Engineer"] : [],
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error("Error extracting Facebook profile data:", error);
    return null;
  }
};
