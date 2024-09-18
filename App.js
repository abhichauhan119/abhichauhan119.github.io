const APP = {
  SW: null,
  init() {
    //called after DOMContentLoaded
    //register our service worker
    APP.registerSW();
    // document.querySelector('h2').addEventListener('click', APP.addImage);
  },
  registerSW() {
    if ('serviceWorker' in navigator && 'PeriodicSyncManager' in window) {
      console.log("Inside Register Service Worker")
      navigator.serviceWorker.register('/sw.js').then(async (registration) => {
        console.log("Inside Register Service Worker found sw.js")
        APP.SW =
        registration.installing ||
        registration.waiting ||
        registration.active;
        const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
        console.log(`Inside Register Service Worker found sw.js status is ${status.state}`)
      
        if (status.state === 'granted') {
            try {
                await registration.periodicSync.register('content-sync', {
                    minInterval: 1000 // Sync every 10 seconds
                });
                console.log('Periodic Sync registered to run every 10 seconds');
            } catch (error) {
                console.error('Periodic Sync registration failed:', error);
            }
        } else if (status.state === 'prompt') {
          console.log('Periodic background sync permission needs to be prompted');
          // You may guide users here to manually enable permissions if possible.
          showPermissionPromptUI();
      }else if (status.state === 'denied') {
          console.log('Periodic background sync permission denied');
          // Show the UI to inform the user and prompt them to take action.
          showPermissionDeniedUI();
        }
      }).catch((error) => {
          console.error('Service Worker registration failed:', error);
      });
    } else {
        console.log('Periodic Sync not supported');
    }
  }
};

document.addEventListener('DOMContentLoaded', APP.init);

function showPermissionDeniedUI() {
  document.getElementById('permission-denied-message').style.display = 'block';
}

function showPermissionPromptUI() {
  document.getElementById('permission-prompt-message').style.display = 'block';
}

function handleManualPermission() {
  alert('To enable background sync permission, go to the browser settings -> Site settings -> Permissions -> Background sync, and allow it for this site.');
}