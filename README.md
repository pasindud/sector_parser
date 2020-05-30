Demo - https://pasindud.github.io/sector_parser

### Example

```
<script src="release/bundle.js">

<script>
fetch('path/to/file.sct')
    .then(
        function(response) {
            response.text().then(function(data) {
                decode(data);
            });
        });

function decode(data) {
    const region = Bundle.Region.parse(data);
    const geo = Bundle.Geo.parse(data);
    const vor = Bundle.Vor.parse(data);
    const ndb = Bundle.Ndb.parse(data);
    const fix = Bundle.Fix.parse(data);
    const info = Bundle.Info.parse(data);
    const airport = Bundle.Airport.parse(data);

    // Get GeoJSON
    const geoJsonBySections = Bundle.getGeoJson([regions, geos]);
    const geoJsonAllSections = Bundle.getAllGeoJson(data);
}
</script>
```

- Test - 
```
npm test
```

- Lint - 
```
npm run-script lint
```

- Browserify - 
```
browserify  src/main.js --standalone Bundle > release/bundle.js
```
