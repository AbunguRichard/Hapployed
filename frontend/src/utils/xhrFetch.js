// XHR-based fetch replacement to bypass Emergent monitoring script conflicts
// XMLHttpRequest is not intercepted by rrweb/monitoring scripts

export const xhrFetch = (url, options = {}) => {
  console.log('[xhrFetch] Request:', url, options);
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = options.method || 'GET';
    
    // Open the request
    xhr.open(method, url, true);
    
    // Set headers
    if (options.headers) {
      Object.keys(options.headers).forEach(key => {
        xhr.setRequestHeader(key, options.headers[key]);
      });
    }
    
    // Set credentials
    if (options.credentials === 'include') {
      xhr.withCredentials = true;
    }
    
    // Handle response
    xhr.onload = function() {
      console.log('[xhrFetch] Response status:', xhr.status);
      console.log('[xhrFetch] Response text:', xhr.responseText);
      
      let data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch (e) {
        console.error('[xhrFetch] JSON parse error:', e);
        data = xhr.responseText;
      }
      
      const response = {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        data: data,
        headers: {
          get: (name) => xhr.getResponseHeader(name)
        },
        text: () => Promise.resolve(xhr.responseText),
        json: () => Promise.resolve(data),
        // Add clone() method to prevent errors if called
        clone: function() {
          // Return a new response object with same data
          return {
            ok: this.ok,
            status: this.status,
            statusText: this.statusText,
            data: this.data,
            headers: this.headers,
            text: () => Promise.resolve(xhr.responseText),
            json: () => Promise.resolve(data),
            clone: () => this.clone()
          };
        },
        // Also handle body property if checked
        body: null,
        bodyUsed: true
      };
      
      console.log('[xhrFetch] Resolved response:', response);
      resolve(response);
    };
    
    // Handle errors
    xhr.onerror = function() {
      console.error('[xhrFetch] Network error');
      reject(new Error('Network request failed'));
    };
    
    xhr.ontimeout = function() {
      console.error('[xhrFetch] Timeout');
      reject(new Error('Network request timed out'));
    };
    
    // Send request
    if (options.body) {
      xhr.send(options.body);
    } else {
      xhr.send();
    }
  });
};
