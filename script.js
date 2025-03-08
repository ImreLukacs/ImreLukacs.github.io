document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map-container');
  const mapImage = document.getElementById('map-image');
  let scale = 1;
  let originX = 0;
  let originY = 0;

  mapContainer.addEventListener('wheel', (e) => {
    e.preventDefault();

    // Calculate mouse position relative to the image
    const rect = mapImage.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate zoom direction
    const zoomIntensity = 0.1;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoomFactor = (1 + wheel * zoomIntensity);

    // Update scale
    const prevScale = scale;
    scale *= zoomFactor;
    scale = Math.min(Math.max(scale, 1), 10); // Limit the zoom scale

    // Adjust the origin to zoom to mouse position
    const offsetX = (mouseX - originX) * (scale - prevScale);
    const offsetY = (mouseY - originY) * (scale - prevScale);

    originX -= offsetX / scale;
    originY -= offsetY / scale;

    mapImage.style.transformOrigin = `0 0`;
    mapImage.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;

    updateMarkers();
  });

  const markers = document.querySelectorAll('.photo-marker');
  const popup = document.getElementById('photo-popup');
  const popupImage = document.getElementById('popup-image');
  const popupCaption = document.getElementById('popup-caption');

  markers.forEach(marker => {
    // Position markers correctly during zoom
    marker.style.transformOrigin = '0 0';

    // Click event for markers
    marker.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent map click event
      const photo = marker.getAttribute('data-photo');
      const caption = marker.getAttribute('data-caption');
      popupImage.src = photo;
      popupCaption.textContent = caption;

      // Position the popup
      const rect = marker.getBoundingClientRect();
      popup.style.top = `${rect.top + window.scrollY}px`;
      popup.style.left = `${rect.left + window.scrollX}px`;
      popup.style.display = 'block';
    });
  });

  // Hide popup when clicking outside
  mapContainer.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  // Enable dragging functionality
  let isDragging = false;
  let startX, startY;

  mapContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - originX;
    startY = e.clientY - originY;
    mapContainer.style.cursor = 'grabbing';
  });

  mapContainer.addEventListener('mousemove', (e) => {
    if (isDragging) {
      originX = e.clientX - startX;
      originY = e.clientY - startY;
      mapImage.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
      updateMarkers();
    }
  });

  mapContainer.addEventListener('mouseup', () => {
    isDragging = false;
    mapContainer.style.cursor = 'grab';
  });

  mapContainer.addEventListener('mouseleave', () => {
    isDragging = false;
    mapContainer.style.cursor = 'grab';
  });

  // Update markers' positions when map transforms
  function updateMarkers() {
    markers.forEach(marker => {
      marker.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
    });
  }

  // Call updateMarkers whenever the map transforms
  mapContainer.addEventListener('wheel', (e) => {
    updateMarkers();
  });

  mapContainer.addEventListener('mousemove', (e) => {
    if (isDragging) {
      updateMarkers();
    }
  });
});
