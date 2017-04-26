var map;
function loadMapScenario() {
    map = new Microsoft.Maps.Map(document.getElementById('map'), {
        credentials: 'Ak2hpoGQttZ2uKASnsJGuVrmv-eRsiXEOujObmNd5gpii6QjviUim4A84_4ODwmT',
        center: new Microsoft.Maps.Location(31.33, 35.20),
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        zoom: 8
    });
}