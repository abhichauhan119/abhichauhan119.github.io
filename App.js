const APP = {
  SW: null,
  init() {
    //called after DOMContentLoaded
    //register our service worker
    APP.registerSW();
    // document.querySelector('h2').addEventListener('click', APP.addImage);
  },
  registerSW() {
    async function registerPeriodicSync() {
        const registration = await navigator.serviceWorker.ready;
        // Check if periodicSync is supported
        if ('periodicSync' in registration) {
          // Request permission
          const status = await navigator.permissions.query({
            name: 'periodic-background-sync',
          });

          if (status.state === 'granted') {
            try {
              // Register new sync every 24 hours
              await registration.periodicSync.register('update-cached-content', {
                minInterval: 24 * 60 * 60 * 1000, // 1 day
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
      }

      if('serviceWorker' in navigator) {
        // Register the service worker
        navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        // Register the periodic background sync
        registerPeriodicSync();
      }
    // if ('serviceWorker' in navigator && 'PeriodicSyncManager' in window) {
    //   console.log("Inside Register Service Worker")
    //   navigator.serviceWorker.register('/sw.js').then(async (registration) => {
    //     console.log("Inside Register Service Worker found sw.js")
    //     APP.SW =
    //     registration.installing ||
    //     registration.waiting ||
    //     registration.active;
    //     const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
    //     console.log(`Inside Register Service Worker found sw.js status is ${status.state}`)
      
    //     if (status.state === 'granted') {
    //         try {
    //           registration.periodicSync.register('content-sync-tibara', {
    //                 minInterval: 1000 * 60 * 16
    //             });
    //             console.log('Periodic Sync registered to run every 16 mins');
    //         } catch (error) {
    //             console.error('Periodic Sync registration failed:', error);
    //         }
    //     } else if (status.state === 'prompt') {
    //       console.log('Periodic background sync permission needs to be prompted');
    //       // You may guide users here to manually enable permissions if possible.
    //       showPermissionPromptUI();
    //   }else if (status.state === 'denied') {
    //       console.log('Periodic background sync permission denied');
    //       // Show the UI to inform the user and prompt them to take action.
    //       showPermissionDeniedUI();
    //     }
    //   }).catch((error) => {
    //       console.error('Service Worker registration failed:', error);
    //   });
    } else {
        console.log('Periodic Sync not supported');
    }
  }
};

document.addEventListener('DOMContentLoaded', APP.init);
document.getElementById('request-sync').addEventListener('click', () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register('content-sync-manual').then(() => {
        console.log('Background Sync registered successfully.');
      }).catch(error => {
        console.error('Background Sync registration failed:', error);
      });
    });
  } else {
    console.log('Background Sync is not supported.');
  }
});

navigator.serviceWorker.ready.then((registration) => {
    return registration.periodicSync.getTags();
}).then((tags) => {
    console.log('Registered sync tags:', tags);
}).catch((error) => {
    console.error('Error fetching sync tags:', error);
});
function showPermissionDeniedUI() {
  document.getElementById('permission-denied-message').style.display = 'block';
}

function showPermissionPromptUI() {
  document.getElementById('permission-prompt-message').style.display = 'block';
}

function handleManualPermission() {
  alert('To enable background sync permission, go to the browser settings -> Site settings -> Permissions -> Background sync, and allow it for this site.');
}
