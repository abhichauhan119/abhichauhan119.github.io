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
