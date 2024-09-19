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
  registerSW() {
      if('serviceWorker' in navigator) {
        // Register the service worker
        navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
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


const check = () => {
  if (!("serviceWorker" in navigator)) {
    throw new Error("No Service Worker support!");
  }
  if (!("PushManager" in window)) {
    throw new Error("No Push API Support!");
  }
};

const requestNotificationPermission = async () => {
  const permission = await window.Notification.requestPermission();
  // value of permission can be 'granted', 'default', 'denied'
  // granted: user has accepted the request
  // default: user has dismissed the notification permission popup by clicking on x
  // denied: user has denied the request.
  if (permission !== "granted") {
    throw new Error("Permission not granted for Notification");
  }
};

const main = async () => {
  check();
  const permission = await requestNotificationPermission();
};
