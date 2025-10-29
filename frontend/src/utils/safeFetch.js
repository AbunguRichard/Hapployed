// Fetch wrapper to handle Emergent monitoring script conflicts
// This ensures compatibility with platform monitoring by properly managing response cloning

export const safeFetch = async (url, options = {}) => {
  try {
    // Make the fetch call
    const response = await fetch(url, options);
    
    // Create a clone immediately for monitoring scripts
    const monitoringClone = response.clone();
    
    // Create another clone for our use
    const ourClone = response.clone();
    
    // Read from our clone as text
    const text = await ourClone.text();
    
    // Parse the text
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
    
    // Return a wrapped response object
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: data,
      text: async () => text,
      json: async () => data,
      original: monitoringClone // Keep original available for monitoring
    };
  } catch (error) {
    console.error('SafeFetch error:', error);
    throw error;
  }
};
