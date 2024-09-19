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

self.addEventListener('install', (ev) => {
  console.log(`Version ${version} installed`);
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

function syncContent() {
  try {
      console.log('Synced content called:');
      const apiURL = 'https://api.open-meteo.com/v1/forecast?latitude=51.51&longitude=-0.13&hourly=temperature_2m';
      try {
          const response = await fetch(apiURL);
          const data = await response.json();
          
          // Extract the hourly data
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
      } catch (error) {
          console.error('Error fetching weather data:', error);
      }
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
