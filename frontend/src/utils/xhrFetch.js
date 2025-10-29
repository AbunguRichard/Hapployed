// XHR-based fetch replacement to bypass Emergent monitoring script conflicts
// XMLHttpRequest is not intercepted by rrweb/monitoring scripts

export const xhrFetch = (url, options = {}) => {
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
      let data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch (e) {
        data = xhr.responseText;
      }
      
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        data: data,
        text: () => Promise.resolve(xhr.responseText),
        json: () => Promise.resolve(data)
      });
    };
    
    // Handle errors
    xhr.onerror = function() {
      reject(new Error('Network request failed'));
    };
    
    xhr.ontimeout = function() {
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
