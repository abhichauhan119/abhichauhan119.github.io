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
        const registration = navigator.serviceWorker.ready;
        // Check if periodicSync is supported
        if ('periodicSync' in registration) {
          // Request permission
          const status = navigator.permissions.query({
            name: 'periodic-background-sync',
          });

          if (status.state === 'granted') {
            try {
              // Register new sync every 20 mins
               registration.periodicSync.register('content-sync', {
                minInterval: 20 *60* 1000, // 20 mins
              });
              console.log('Periodic background sync registered!');
            } catch(e) {
              console.error(`Periodic background sync failed:\nx${e}`);
            }
          } else {
            console.info('Periodic background sync is not granted.');
          }
        } else {
          console.log('Periodic background sync is not supported.');
        }
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
