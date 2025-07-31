const locationName = mapLocation;

fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${locationName}`)
  .then(res => res.json())
  .then(data => {
    if (data.length > 0) {
      const lat = data[0].lat;
      const lon = data[0].lon;

      const map = L.map('map').setView([lat, lon], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(locationName)
        .openPopup();
    } else {
      document.getElementById('map').innerHTML = "Location not found 😢";
    }
  })
  .catch(err => {
    console.error("Map error:", err);
    document.getElementById('map').innerHTML = "Error loading map!";
  });
