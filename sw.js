const version = 3;
let staticName = `staticCache-${version}`;
let dynamicName = `dynamicCache`;
let fontName = `fontCache-${version}`;
let imageName = `imageCache-${version}`;
let options = {
  ignoreSearch: false,
  ignoreMethod: false,
  ignoreVary: false,
};
//starter html and css and js files
let assets = ['/', '/index.html', '/main.css', 'App.js'];
//starter images
let imageAssets = [
  '/img/1011-800x600.jpg',
  '/img/1011-800x600.jpg?id=one',
  '/img/1011-800x600.jpg?id=two',
  '/img/1011-800x600.jpg?id=three',
];
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
const saveSubscription = subscription => {
  const SERVER_URL = "http://localhost:4000/save-subscription";
  const response = fetch(SERVER_URL, {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(subscription)
  });
  return response.json();
};

self.addEventListener('install', (ev) => {
  console.log(`Version ${version} installed`);
  const applicationServerKey = urlB64ToUint8Array(
    "BJ5IxJBWdeqFDJTvrZ4wNRu7UY2XigDXjgiUBYEYVXDudxhEs0ReOJRBcBHsPYgZ5dyV8VjyqzbQKS8V7bUAglk"
  );
  const options = { applicationServerKey, userVisibleOnly: true };
  const subscription = self.registration.pushManager.subscribe(options);
  console.log(`Subscription ${subscription} created`);
  const response = saveSubscription(subscription);
  console.log(response);
});

self.addEventListener('activate', (ev) => {
  console.log('activated');
});

self.addEventListener('fetch', (ev) => {
  console.log(`fetch request for: ${ev.request.url}`);
});

self.addEventListener('message', (ev) => {
  console.log(`Message event received: ${ev}`);
});

self.addEventListener('periodicsync', (event) => {
  console.log(`Periodic Sync Event is called : ${event}`)
  if (event.tag === 'content-sync') {
    console.log('content sync tag is found and inside');
    event.waitUntil(syncContent());
  }
});

self.addEventListener('sync', event => {
  console.log(`Sync Event is called : ${event}`)
  if (event.tag === 'content-sync-manual') {
    console.log('content-sync-manual tag is found and inside');
    event.waitUntil(syncContentManual());
  }
});


self.addEventListener("push", function(event) {
  if (event.data) {
    console.log("Push event!! ", event.data.text());
  } else {
    console.log("Push event but no data");
  }
});


async function syncContent() {
  try {
      console.log('Synced content called:');
      const apiURL = 'https://api.open-meteo.com/v1/forecast?latitude=51.51&longitude=-0.13&hourly=temperature_2m';
      try {
          const data = await fetch(apiURL)
                      .then(response => {
                        if (!response.ok) {
                          throw new Error('Network response was not ok');
                        }
                        return response.json(); // Parse the response as JSON
                      })
                      .catch(error => {
                        console.error('There was a problem with the fetch operation:', error);
                      });
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  type: 'weather-update',
                  data: data // Example data
                });
              });
            });
      } catch (error) {
          console.error('Error fetching weather data:', error);
      }
    console.log('Synced content called done');
  } catch (error) {
      console.error('Error syncing weather data:', error);
  }
}

function syncContentManual() {
  console.log('Synced content Manual called:');
  syncContent();
  console.log('Synced content Manual Done:');
}
