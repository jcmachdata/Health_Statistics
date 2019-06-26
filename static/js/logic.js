// Creating map object
var myMap = L.map("map", {
    center: [20, -30],
    zoom: 2.2
});

var filterDict = {
  'Cardiovascular_diseases':0,
  'Diabetes_mellitus':0,
  'Malignant_neoplasms' :0,
  'Respiratory_diseases': 0,
  'Infectious_and_parasitic_diseases': 0,
  'Respiratory_Infectious': 0,
  'Sudden_infant_death_syndrome': 0,
  'Maternal_conditions': 0,
  'Neonatal_conditions': 0,
  'Nutritional_deficiencies': 0,
  'Mental_and_substance_use_disorders': 0}

// Adding tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
}).addTo(myMap);

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function diseaseSum (dictionary, feature) {
  var mySum = 0
  for (var key in dictionary) {
    if (dictionary[key]) {
      mySum += feature.properties[`${key}`]
    }
  }
  return round(mySum, 2)
}

function drawMap(data) {

  var geojson = L.choropleth(data, {
      valueProperty: function (feature) {
        return diseaseSum(filterDict, feature)
      },
      scale: ['white', 'red'],
      steps: 50,
      mode: 'q',
      style: {
          color: '#fff',
          weight: 1,
          fillOpacity: 1
      },

      // Binding a pop-up
      onEachFeature: function(feature, layer) {
        toolTipText(feature)
        layer.bindPopup(toolTipText(feature))
          // layer.bindPopup("<h8>" + feature.properties.name + "<\h8><br><h10>" + diseaseSum(filterDict, feature) + "<\h10>");
        },
  }).addTo(myMap);
}

function returnReadable (disease) {
  switch (disease) {
    case "Cardiovascular_diseases":
      return "Cardiovascular"
    case "Malignant_neoplasms":
      return "Cancer"
    case "Diabetes_mellitus":
      return "Diabetes"
    case "Respiratory_diseases":
      return "Respiratory Diseases"
    case "Infectious_and_parasitic_diseases":
      return "Infectious and Parasitic"
    case "Respiratory_Infectious":
      return "Infectious Respiratory"
    case "Neonatal_conditions":
      return "Neonatal Conditions"
    case "Maternal_conditions":
      return "Maternal Conditions"
    case "Sudden_infant_death_syndrome":
      return "SIDS"
    case "Nutritional_deficiencies":
      return "Nutritional Deficiencies"
    case "Mental_and_substance_use_disorders":
      return "Mental and Substance Use Disorders"
  }
}

function toolTipText (feature) {
  total = 0
  var returnHtml = "<h6>" + feature.properties.name + "</h6><hr>"
  for (var key in filterDict) {
    if (filterDict[key]) {
      returnHtml += returnReadable(key) + ": " + round(feature.properties[`${key}`], 2) + "<br>"
      total += feature.properties[`${key}`]
    }
  }
  returnHtml += "<hr><h7> Total: " + round(total, 2) + "</h7>"
  console.log(`return html is: ${returnHtml}`);
  return returnHtml
}

(async function(){
    // Link to GeoJSON
    const APILink = "/daly";

    var choices = L.control({position: 'bottomleft'});

    choices.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info');
        div.innerHTML = '<h6>Non-communicable</h6><form> \
                              <input id="Cardiovascular_diseases" type="checkbox"/> Cardiovascular<br>\
                              <input id="Malignant_neoplasms" type="checkbox"/> Cancer<br>\
                              <input id="Diabetes_mellitus" type="checkbox"/> Diabetes<br>\
                              <input id="Respiratory_diseases" type="checkbox"/> Respiratory Diseases<br>\
                              <hr>\
                          <input id="Mental_and_substance_use_disorders" type="checkbox"/> Mental and <br>Substance Abuse Disorders<br>\
                              <hr>\
                          <h6>Communicable</h6> \
                              <input id="Infectious_and_parasitic_diseases" type="checkbox"/> Infectious and Parasitic<br>\
                              <input id="Respiratory_Infectious" type="checkbox"/> Infectious Respiratory<br>\
                              <hr>\
                          <h6>Maternal and Neonatal</h6>\
                            <input id="Sudden_infant_death_syndrome" type="checkbox"/> SIDS<br>\
                            <input id="Nutritional_deficiencies" type="checkbox"/> Nutritional Deficiencies<br>\
                            <input id="Neonatal_conditions" type="checkbox"/> Neonatal Conditions<br>\
                            <input id="Maternal_conditions" type="checkbox"/> Maternal Conditions<br>\
                          </form>';

        return div;
    };
    choices.addTo(myMap);

    // add the event handler
    function handleCommand() {
      if (this.checked) {
        filterDict[this.id] = 1
      }
      else {
        filterDict[this.id] = 0
      }
       drawMap(data)
    }

    document.getElementById("Cardiovascular_diseases").addEventListener("click", handleCommand, false);
    document.getElementById("Malignant_neoplasms").addEventListener("click", handleCommand, false);
    document.getElementById("Diabetes_mellitus").addEventListener("click", handleCommand, false);
    document.getElementById("Respiratory_diseases").addEventListener("click", handleCommand, false);
    document.getElementById("Infectious_and_parasitic_diseases").addEventListener("click", handleCommand, false);
    document.getElementById("Respiratory_Infectious").addEventListener("click", handleCommand, false);
    document.getElementById("Sudden_infant_death_syndrome").addEventListener("click", handleCommand, false);
    document.getElementById("Nutritional_deficiencies").addEventListener("click", handleCommand, false);
    document.getElementById("Neonatal_conditions").addEventListener("click", handleCommand, false);
    document.getElementById("Maternal_conditions").addEventListener("click", handleCommand, false);
    document.getElementById("Mental_and_substance_use_disorders").addEventListener("click", handleCommand, false);

    // Grab data with D3
    data = await d3.json(APILink)
})()
