// Fetch wrapper to handle response reading without cloning issues
// This ensures compatibility by reading response once

export const safeFetch = async (url, options = {}) => {
  try {
    // Make the fetch call
    const response = await fetch(url, options);
    
    // Read response as text ONCE
    const text = await response.text();
    
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
      json: async () => data
    };
  } catch (error) {
    console.error('SafeFetch error:', error);
    throw error;
  }
};
