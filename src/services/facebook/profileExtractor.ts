
/**
 * Client-side Facebook profile scraper
 * Note: This is an experimental feature with significant limitations.
 * It uses public information only and has limited capabilities when running client-side.
 */

// Profile data model
export interface FacebookProfileData {
  interests: string[];
  recentActivity: string[];
  location?: string;
  age?: string;
  occupation?: string;
  extractedAt: string;
  url: string;
}

// Simple function to determine if a URL appears to be a Facebook profile
export const isValidFacebookProfileUrl = (url: string): boolean => {
  return url.includes('facebook.com') && 
         (url.includes('/profile') || 
          !url.includes('/groups/') && 
          !url.includes('/pages/') && 
          !url.includes('/events/'));
};

// Main extraction function
export const extractProfileData = async (profileUrl: string): Promise<FacebookProfileData | null> => {
  if (!isValidFacebookProfileUrl(profileUrl)) {
    throw new Error("The URL doesn't appear to be a valid Facebook profile URL");
  }
  
  // In a real implementation, you would need to use a server-side API to fetch the profile
  // Client-side scraping is limited due to CORS and Facebook's security measures
  // For this experiment, we'll simulate extraction with a mock implementation
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Extract username or ID from URL for a more personalized mock response
  let personalizationSeed = "";
  try {
    const url = new URL(profileUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    personalizationSeed = pathParts[0] || Math.random().toString(36).substring(7);
  } catch (e) {
    personalizationSeed = Math.random().toString(36).substring(7);
  }
  
  // Generate a deterministic but varied mock profile based on the URL
  const mockData = generateMockProfileData(profileUrl, personalizationSeed);
  
  // Add debugging information
  console.log("Extracted profile data:", mockData);
  
  return mockData;
};

// Helper to generate mock profile data
const generateMockProfileData = (url: string, seed: string): FacebookProfileData => {
  // Create a simple hash from the seed for deterministic but varied responses
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Potential interests and activities
  const allInterests = [
    "Hiking", "Reading", "Travel", "Cooking", "Photography", 
    "Music", "Movies", "Technology", "Art", "Sports",
    "Fitness", "Gaming", "Gardening", "Writing", "Dancing",
    "Cycling", "Yoga", "Fashion", "Food", "Animals"
  ];
  
  const allActivities = [
    "Went to a concert", "Watched a movie", "Shared an article about technology",
    "Posted vacation photos", "Updated profile picture", "Attended an event",
    "Liked a restaurant", "Commented on a friend's post", "Joined a group",
    "Shared a news article", "Marked attending an upcoming event"
  ];
  
  const locations = ["New York", "San Francisco", "Chicago", "Los Angeles", 
                      "Seattle", "Austin", "Boston", "Portland", "Denver", "Miami"];
  
  const occupations = ["Software Engineer", "Designer", "Marketing Specialist", 
                        "Teacher", "Student", "Doctor", "Writer", "Artist", 
                        "Business Owner", "Consultant"];
  
  // Select a deterministic subset based on the hash
  const selectItems = (items: string[], count: number, offset: number = 0): string[] => {
    const selected: string[] = [];
    for (let i = 0; i < count; i++) {
      const index = (hash + i + offset) % items.length;
      selected.push(items[index]);
    }
    return selected;
  };
  
  return {
    interests: selectItems(allInterests, 3 + (hash % 3)),
    recentActivity: selectItems(allActivities, 2 + (hash % 2), 10),
    location: locations[hash % locations.length],
    occupation: occupations[(hash * 3) % occupations.length],
    age: `${25 + (hash % 30)}`,
    extractedAt: new Date().toISOString(),
    url: url
  };
};
