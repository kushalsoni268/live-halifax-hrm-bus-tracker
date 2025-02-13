//create map in leaflet and tie it to the div called 'theMap'
const map = L.map('theMap').setView([44.650627, -63.597140], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker([44.650690, -63.596537]).addTo(map)
    .bindPopup('This is a sample popup. You can put any html structure in this including extra bus data. You can also swap this icon out for a custom icon. A png file has been provided for you to use if you wish.')
    .openPopup();

// Fetch real-time transit data
async function fetchBusData() {
    const apiUrl = 'https://prog2700.onrender.com/hrmbuses';
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Filter buses on routes 1-10
        const filteredBuses = data.entity.filter(bus => {
            const routeId = parseInt(bus.vehicle.trip.routeId, 10);
            return routeId >= 1 && routeId <= 10;
        });

        // Buses on all routes
        // const allRouteBuses = data.entity;

        // Convert data to GeoJSON format
        const geoJsonData = {
            type: 'FeatureCollection',
            features: filteredBuses.map(bus => {
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

        console.log("geoJsonData: ", geoJsonData);    
    } catch (error) {
        console.error('Error fetching bus data:', error);
    }
}
