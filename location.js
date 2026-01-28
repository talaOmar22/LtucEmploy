let map;
let marker;
let locationData = {};
let ipData = {};

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupEventListeners();
    getIPAddress();
});

function initializeMap() {
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
}

function setupEventListeners() {
    document.getElementById('getLocationBtn').addEventListener('click', getGPSLocation);
    document.getElementById('copyLocationBtn').addEventListener('click', copyLocationCoordinates);
    document.getElementById('getIpBtn').addEventListener('click', getIPAddress);
    document.getElementById('copyIpBtn').addEventListener('click', copyIP);
}

function getGPSLocation() {
    const btn = document.getElementById('getLocationBtn');
    const status = document.getElementById('locationStatus');
    
    btn.disabled = true;
    status.textContent = 'Getting your location...';
    status.className = 'status-message loading';

    if (!navigator.geolocation) {
        status.textContent = 'Geolocation is not supported by your browser.';
        status.className = 'status-message error';
        btn.disabled = false;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(position) {
            const coords = position.coords;
            locationData = {
                latitude: coords.latitude.toFixed(6),
                longitude: coords.longitude.toFixed(6),
                accuracy: coords.accuracy.toFixed(2) + ' meters',
                altitude: coords.altitude ? coords.altitude.toFixed(2) + ' meters' : 'N/A'
            };

            document.getElementById('latitude').textContent = locationData.latitude;
            document.getElementById('longitude').textContent = locationData.longitude;
            document.getElementById('accuracy').textContent = locationData.accuracy;
            document.getElementById('altitude').textContent = locationData.altitude;

            // Update map
            map.setView([coords.latitude, coords.longitude], 13);
            if (marker) {
                marker.setLatLng([coords.latitude, coords.longitude]);
            } else {
                marker = L.marker([coords.latitude, coords.longitude]).addTo(map)
                    .bindPopup(`<b>Your Location</b><br>Lat: ${locationData.latitude}<br>Lng: ${locationData.longitude}`);
            }

            status.textContent = 'Location found successfully!';
            status.className = 'status-message success';
            document.getElementById('copyLocationBtn').disabled = false;
            btn.disabled = false;
        },
        function(error) {
            let errorMsg = 'Unable to get location: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg += 'Permission denied. Please enable location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg += 'Position information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMsg += 'The request timed out.';
                    break;
                default:
                    errorMsg += 'An unknown error occurred.';
            }
            status.textContent = errorMsg;
            status.className = 'status-message error';
            btn.disabled = false;
        }
    );
}

function copyLocationCoordinates() {
    const text = `Latitude: ${locationData.latitude}, Longitude: ${locationData.longitude}`;
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback('copyLocationBtn', 'Location copied!');
    });
}

function getIPAddress() {
    const btn = document.getElementById('getIpBtn');
    const status = document.getElementById('ipStatus');
    
    btn.disabled = true;
    status.textContent = 'Fetching IP information...';
    status.className = 'status-message loading';

    // Using ipapi.co free API (no key required)
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            ipData = {
                ip: data.ip,
                isp: data.org || 'N/A',
                country: data.country_name || 'N/A',
                city: data.city || 'N/A',
                region: data.region || 'N/A',
                timezone: data.timezone || 'N/A'
            };

            document.getElementById('publicIp').textContent = ipData.ip;
            document.getElementById('isp').textContent = ipData.isp;
            document.getElementById('country').textContent = ipData.country;
            document.getElementById('city').textContent = ipData.city;
            document.getElementById('region').textContent = ipData.region;
            document.getElementById('timezone').textContent = ipData.timezone;

            status.textContent = 'IP information retrieved successfully!';
            status.className = 'status-message success';
            document.getElementById('copyIpBtn').disabled = false;
            btn.disabled = false;
        })
        .catch(error => {
            console.error('Error fetching IP:', error);
            status.textContent = 'Error fetching IP information. Please try again.';
            status.className = 'status-message error';
            btn.disabled = false;
        });
}

function copyIP() {
    navigator.clipboard.writeText(ipData.ip).then(() => {
        showCopyFeedback('copyIpBtn', 'IP copied!');
    });
}

function showCopyFeedback(elementId, message) {
    const btn = document.getElementById(elementId);
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-check"></i> ${message}`;
    btn.style.background = '#48bb78';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 2000);
}
