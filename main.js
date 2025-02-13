//create map in leaflet and tie it to the div called 'theMap'
const map = L.map('theMap').setView([44.650627, -63.597140], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const busIcon = L.icon({
    iconUrl: 'bus.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

// Fetch real-time transit data
async function fetchBusData() {
    const apiUrl = 'https://prog2700.onrender.com/hrmbuses';
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Filter buses on routes 1-10
        // const filteredBuses = data.entity.filter(bus => {
        //     const routeId = parseInt(bus.vehicle.trip.routeId, 10);
        //     return routeId >= 1 && routeId <= 10;
        // });

        // Buses on all routes
        const allRouteBuses = data.entity;

        // Convert data to GeoJSON format
        const geoJsonData = {
            type: 'FeatureCollection',
            features: allRouteBuses.map(bus => {
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [bus.vehicle.position.longitude, bus.vehicle.position.latitude]
                    },
                    properties: {
                        vehicleId: bus.vehicle.vehicle.id,
                        label: bus.vehicle.vehicle.label,
                        routeId: bus.vehicle.trip.routeId,
                        bearing: bus.vehicle.position.bearing || 0,
                        speed: bus.vehicle.position.speed || 0
                    }
                };
            })
        };

        // Update the map
        updateMapWithBusMarkers(geoJsonData);
    } catch (error) {
        console.error('Error fetching bus data:', error);
    }
}

let busMarkersLayer;

// Function to update the map
function updateMapWithBusMarkers(geoJsonData) {
    // Remove previous markers
    if (busMarkersLayer) {
        map.removeLayer(busMarkersLayer);
    }

    // Add new markers
    busMarkersLayer = L.geoJSON(geoJsonData, {
        pointToLayer: function (feature, latlng) {
            const marker = L.marker(latlng, {
                icon: busIcon,
                rotationAngle: feature.properties.bearing
            });
            marker.bindPopup(`
                <strong>Bus:</strong> ${feature.properties.label}<br>
                <strong>Route:</strong> ${feature.properties.routeId}<br>
                <strong>Speed:</strong> ${feature.properties.speed.toFixed(2)} km/h
            `);
            return marker;
        }
    }).addTo(map);
}

fetchBusData();