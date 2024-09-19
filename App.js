const urlB64ToUint8Array = base64String => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
const saveSubscription = async subscription => {
  const SERVER_URL = "http://localhost:4000/save-subscription";
  const response = await fetch(SERVER_URL, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(subscription)
  });
  return response.json();
};

const APP = {
  SW: null,
  init() {
    //called after DOMContentLoaded
    //register our service worker
    APP.registerSW();
    // Register Background Sync
    APP.registerPeriodicSync();
    // Get Registered Periodic event
    APP.getRegisteredPeriodicEvent();
  },
  async registerSW() {
      if('serviceWorker' in navigator) {
        // Register the service worker
         const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        console.log('Service Worker registered successfully with scope: ', registration.scope);

        // Wait until the service worker is ready
        const swRegistration = await navigator.serviceWorker.ready;
        
        const applicationServerKey = urlB64ToUint8Array(
          "BJ5IxJBWdeqFDJTvrZ4wNRu7UY2XigDXjgiUBYEYVXDudxhEs0ReOJRBcBHsPYgZ5dyV8VjyqzbQKS8V7bUAglk"
        );
        
        const options = { applicationServerKey, userVisibleOnly: true };
        
        // Subscribe to push notifications
        const subscription = await swRegistration.pushManager.subscribe(options);
        console.log(`Subscription ${subscription} created`);
        
        // Save subscription to the server
        const response = await saveSubscription(subscription);
        console.log(response);
      }
  },
  registerPeriodicSync() {
      navigator.serviceWorker.ready.then((registration) => {
          navigator.permissions.query({ name: 'periodic-background-sync' })
          .then(permissionStatus => {
            console.log('Permission status:', permissionStatus.state);
            // You can also add logic based on the state value
            if (permissionStatus.state === 'granted') {
              try {
                // Register new sync every 20 mins
                 registration.periodicSync.register('content-sync', {
                  minInterval: 20 *60* 1000, // 20 mins
                });
                console.log('Periodic background sync registered!');
              } catch(e) {
                console.error(`Periodic background sync failed:\nx${e}`);
              }
            } else if (permissionStatus.state === 'denied') {
               console.info('Periodic background sync is not granted.');
            } else if (permissionStatus.state === 'prompt') {
               console.info('Periodic background sync is not granted.');
            }
          })
          .catch(error => {
            console.error('Error querying permissions:', error);
          });
      }).catch((error) => {
          console.error('Error fetching sync tags:', error);
      });
  }, 
  getRegisteredPeriodicEvent(){
      navigator.serviceWorker.ready.then((registration) => {
          return registration.periodicSync.getTags();
      }).then((tags) => {
          console.log('Registered sync tags:', tags);
      }).catch((error) => {
          console.error('Error fetching sync tags:', error);
      });
  }
};

document.addEventListener('DOMContentLoaded', APP.init);
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'weather-update') {
        const data = event.data.data;
        const times = data.hourly.time;
        const temperatures = data.hourly.temperature_2m;
        
        // Get the table body element
        const tableBody = document.querySelector('#weather-table tbody');
        
        // Populate the table with the data
        times.forEach((time, index) => {
            const row = document.createElement('tr');
            const timeCell = document.createElement('td');
            const tempCell = document.createElement('td');
            
            // Format time for readability
            const formattedTime = new Date(time).toLocaleString();
  
            timeCell.textContent = formattedTime;
            tempCell.textContent = temperatures[index] + '°C';
            
            row.appendChild(timeCell);
            row.appendChild(tempCell);
            tableBody.appendChild(row);
          });
    }
  });
}
