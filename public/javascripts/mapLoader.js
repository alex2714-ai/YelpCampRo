mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  // style: "mapbox://styles/mapbox/outdoors-v11",
  style: "mapbox://styles/alexutzu27/cl7j4742u002114o4o30hn1yi",
  center: campground.geometry.coordinates,
  zoom: 9,
});

const marker1 = new mapboxgl.Marker({
  color: "#FF0000",
})
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(`<h6>${campground.title}</h6>`)
  )
  .addTo(map);
