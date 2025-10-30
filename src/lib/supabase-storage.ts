// Mock user management - no authentication yet
export const getMockUser = () => {
  let userId = localStorage.getItem('user_storage_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_storage_id', userId);
  }
  return {
    id: userId,
    name: "Mock User",
    email: "user@example.com"
  };
};

// Automatic storage in Supabase via edge function
export const storeMediaInSupabase = async (
  urls: string[], 
  mediaType: 'image' | 'video' | 'audio' = 'image'
): Promise<string[]> => {
  try {
    const user = getMockUser();
    
    console.log(`[Supabase Storage] Storing ${urls.length} ${mediaType}(s) for user ${user.id}`);
    console.log(`[Supabase Storage] URLs to store:`, urls);
    
    const response = await fetch('https://xlvyqizsgyowcovwyjbr.supabase.co/functions/v1/store-generated-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4bHZ5cWl6c2d5b3djb3Z3eWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc0Njg5MjgsImV4cCI6MjA0MzA0NDkyOH0.0YwTW8FQgY2J2wRnEWyJxEy5GUjf6KaAe-8fCIHyxqE',
      },
      body: JSON.stringify({
        urls: urls,
        user_id: user.id,
        media_type: mediaType,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Supabase Storage] Failed:', { status: response.status, error: errorText });
      console.warn('[Supabase Storage] Falling back to localStorage');
      
      // Fallback to localStorage
      saveToLocalStorage(urls, mediaType);
      return urls;
    }
    
    const responseText = await response.text();
    console.log(`[Supabase Storage] Response:`, { status: response.status, body: responseText });

    const data = JSON.parse(responseText);
    const storedUrls = data.urls || urls;
    
    // Also save to localStorage for quick access
    saveToLocalStorage(storedUrls, mediaType);
    
    console.log(`[Supabase Storage] Successfully stored ${storedUrls.length} ${mediaType}(s)`);
    console.log(`[Supabase Storage] Stored URLs:`, storedUrls);
    return storedUrls;
  } catch (error) {
    console.error('[Supabase Storage] Error:', error);
    console.warn('[Supabase Storage] Falling back to localStorage');
    
    // Fallback to localStorage
    saveToLocalStorage(urls, mediaType);
    return urls;
  }
};

// Local storage fallback
const saveToLocalStorage = (urls: string[], mediaType: string) => {
  const storageKey = mediaType === 'video' ? 'video_history' : 'image_history';
  const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const newItems = urls.map((url, index) => ({ 
    id: `${Date.now()}-${index}`, 
    url,
    mediaType 
  }));
  localStorage.setItem(storageKey, JSON.stringify([...newItems, ...history]));
};
