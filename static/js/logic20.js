// Store our API endpoint inside queryUrl

Url = 'daly'


function getIntervals(range, parts) {
    var result = [],
        length = (range[1] - range[0]) / parts,
        i = range[0];

    // result.push(i)
    while (i < range[1]) {
        // i += length
        result.push([i]);
        i += length;
    }

    for (i = 0; i<parts; i++) {
      // console.log(`interval ${i}: > ${result[i]}`);
    }
    // console.log(`intervals: ${result}`);
    return (result)
}

function getColor(value, min, max) {
  // console.log(`getColor min: ${min}, max: ${max}`);}
  var myintervals = getIntervals([min, max], 7)
   switch (true) {
   case Number(value) > (myintervals[5]):
    // console.log(`${value} is greater than ${myintervals[5]}`);
     // return "#ea2c2c";
     return "#4d5656"
   case Number(value) > (myintervals[4]):
   // console.log(`${value} is greater than ${myintervals[4]}`);

     // return "#ea822c";
     return "#717d7e"
   case Number(value) > (myintervals[3]):
   // console.log(`${value} is greater than ${myintervals[3]}`);

     // return "#ee9c00";
     return "#839192"
   case Number(value) > (myintervals[2]):
   // console.log(`${value} is greater than ${myintervals[2]}`);

     // return "#eecc00";
     return "#95a5a6"
   case Number(value) > (myintervals[1]):
   // console.log(`${value} is greater than ${myintervals[1]}`);

     // return "#d4ee00";
     return "#bfc9ca";
   case Number(value) > (myintervals[0]):
   // console.log(`${value} is greater than ${myintervals[0]}`);

    return "#d5dbdb";
     // return "#98ee00";
   }
}

function getOpacity(value, min, max) {
  // console.log(`getColor min: ${min}, max: ${max}`);
  var myintervals = getIntervals([min, max], 5)
  // opacityIncrements = 0.2
   switch (true) {
   case value > myintervals[6]:
      return 0.1
  case value > myintervals[5]:
     return 0.3;
   case value > myintervals[4]:
     return 0.5;
   case value > myintervals[3]:
     return 0.7;
   case value > myintervals[2]:
     return 0.8;
   case value > myintervals[1]:
     return 0.9;
   case value >= myintervals[0]:
     return 1;
   }
}

function unpack(rows, disease) {
  // console.log(`received rows: ${rows}, disease: ${disease}`);
  return rows.map(function(row) {
    value = row.properties[`${disease}`]
    // console.log(`returning ${value}`);
    return value;
  });
}


function diseaseMinMax (healthData, disease) {
  // console.log(`sending: ${healthData}`);
  diseaseArray = unpack(healthData, disease)
  // discard 0 for the purpose of finding min
  diseaseArray = diseaseArray.filter(function(val) {
    return val !== 0;
  });

  // console.log(`diseaseArray for ${disease} is: ${diseaseArray}`);
  min = Math.min(...diseaseArray)
  max = Math.max(...diseaseArray)
  // console.log(`max is for country: `)
  // console.log(`min for ${disease} is ${min}`);
  // console.log(`max for ${disease} is ${max}`);
  let i = diseaseArray.indexOf(Math.max(...diseaseArray));
  // console.log(`max for ${disease} is at index ${i}`)
  return [min, max]
}


// console.log(getIntervals([12, 48], 4));

function createFeatures(healthData) {
    // const temp = diseaseMinMax(healthData, 'Cardiovascular_diseases')
    // const min = temp[0]
    // const max = temp[1]

    // console.log(`min is: ${min}, max is: ${max}`);
    function cardioStyle(feature) {
      return {
          fillColor: getColor(feature.properties.Cardiovascular_diseases,
            diseaseMinMax(healthData, 'Cardiovascular_diseases')[0],
            diseaseMinMax(healthData, 'Cardiovascular_diseases')[1]),
          weight: 2,
          opacity: 0.7,
          color: 'white',  //Outline color
          fillOpacity: 0.4
          // getOpacity(feature.properties.Cardiovascular_diseases,
          //   diseaseMinMax(healthData, 'Cardiovascular_diseases')[0],
          //   diseaseMinMax(healthData, 'Cardiovascular_diseases')[1])
      };
    }

    function cancerStyle(feature) {
      return {
          fillColor: getColor(Number(feature.properties.Malignant_neoplasms),
          diseaseMinMax(healthData, 'Malignant_neoplasms')[0],
          diseaseMinMax(healthData, 'Malignant_neoplasms')[1]),
          weight: 2,
          opacity: 0.7,
          color: 'white',  //Outline color
          fillOpacity: 0.4
      };
    }

    // console.log(`min for diabetes: ${diseaseMinMax(healthData, 'Diabetes_mellitus')[0]}, max for diabetes: ${diseaseMinMax(healthData, 'Diabetes_mellitus')[1]}`);
    // console.log();

    function diabetesStyle(feature) {
      return {
          fillColor: getColor(Number(feature.properties.Diabetes_mellitus),
          diseaseMinMax(healthData, 'Diabetes_mellitus')[0],
          diseaseMinMax(healthData, 'Diabetes_mellitus')[1]),
          weight: 2,
          opacity: 0.7,
          color: 'white',  //Outline color
          fillOpacity: 0.4
      };
    }

    function diseaseSumStyle(feature) {
      diseaseSum =  Number(feature.properties.Diabetes_mellitus) +
                    Number(feature.properties.Cardiovascular_diseases) +
                    Number(feature.properties.Malignant_neoplasms)
      diseaseSumMin = diseaseMinMax(healthData, 'Diabetes_mellitus')[0] +
                    diseaseMinMax(healthData, 'Cardiovascular_diseases')[0] +
                    diseaseMinMax(healthData, 'Malignant_neoplasms')[0]

      diseaseSumMax = diseaseMinMax(healthData, 'Diabetes_mellitus')[1] +
                    diseaseMinMax(healthData, 'Cardiovascular_diseases')[1] +
                    diseaseMinMax(healthData, 'Malignant_neoplasms')[1]

      return {
          fillColor: getColor(diseaseSum, diseaseSumMin, diseaseSumMax),
          weight: 2,
          opacity: 0.7,
          color: 'white',  //Outline color
          fillOpacity: 0.4
      };
    }

    var cardio = L.geoJSON(healthData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>" + feature.properties.name + "<\h2><h3> Cardiovascular Diseases: " + feature.properties.Cardiovascular_diseases + "<\h3>");
          },
          style: cardioStyle
        });

    var malignancies = L.geoJSON(healthData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h2>" + feature.properties.name + "<\h2><h3> Cancer: " + feature.properties.Malignant_neoplasms + "<\h3>");
          },
          style: cancerStyle
        });

    var diabetes = L.geoJSON(healthData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h2>" + feature.properties.name + "<\h2><h3> Diabetes: " + feature.properties.Diabetes_mellitus+ "<\h3>");
          },
          style: diabetesStyle
        });

    function onEachFeatureClosure(dataFilter) {
      return function onEachFeature(feature, layer) {
      // Your own logic, that uses dataFilter asum = feature.properties.name
        layer.bindPopup("<h2>" + feature.properties.name + "<\h2><h3> data filter: " + dataFilter + "<\h3>");
      }}

    var diseaseSum = L.geoJSON(healthData, {
          onEachFeature: onEachFeatureClosure(['Diabetes_mellitus', 'Cardiovascular_diseases', 'Malignant_neoplasms']),
          style: diseaseSumStyle
    })

    //
    //   onEachFeature: function(feature, layer) {
    //       sum = feature.properties.name
    //       layer.bindPopup("<h2>" + feature.properties.name + "<\h2><h3> Diabetes: " + feature.properties.Diabetes_mellitus+ "<\h3>");
    //     },
    //     style: diseaseSumStyle
    // })

    // const diseases = [cardio, malignancies, diabetes]
    myMap = createMap(cardio, malignancies, diabetes, diseaseSum);
}


function createMap(cardio, cancer, diabetes, diseaseSum) {
    // Define streetmap and darkmap layers
    const lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.light",
            accessToken: API_KEY
    });

    // console.log(`${diseases[0]}`);
    // Define a baseMaps object to hold our base layers
    const baseMaps = {
            "Light Map": lightmap,
            // "Satellite": satellite,
            // "Outdoors": outdoors
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
            'Cardiovascular Diseases': diseaseSum,
            'Cancer': diseaseSum,
            'Diabetes': diseaseSum
            // Tectonics: tectonics
    };

    const myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 2,
            layers: [lightmap]
            // layers: [lightmap, cardio, malignancies, diabetes]
    });


    var control = L.control.activeLayers(baseMaps, overlayMaps)
    control.addTo(myMap)

  // console.log(control.getActiveBaseLayer().name)

  var overlayLayers = control.getActiveOverlayLayers()
  for (var overlayId in overlayLayers) {
      console.log(overlayLayers[overlayId].name)
  }


    return myMap
}

(async function(){
    // const queryUrl = buildUrl();
    const healthData = await d3.json(Url);
    // const tectonic = await d3.json(Url_tectonic);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(healthData.features);

})()
