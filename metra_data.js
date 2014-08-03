exports.Lines = {
    "MD-W": {
        "BIGTIMBER": "Big Timber Road",
            "ELGIN": "Elgin",
            "NATIONALS": "National Street",
            "SCHAUM": "Schaumburg",
            "ROSELLE": "Roselle",
            "MEDINAH": "Medinah",
            "ITASCA": "Itasca",
            "WOODDALE": "Wooddale",
            "BENSENVIL": "Bensenville",
            "FRANKLIN": "Franklin Park",
            "RIVERGROVE": "River Grove",
            "HANSONPK": "Hanson Park",
            "WESTERNAVE": "Western",
            "CUS": "Union Station"
    }
};

exports.Locations = [
                {"Name": "Union",
                "MetraCode": "CUS",
                "lon": 41.8785369,
                "lat": -87.6391848,
                "Line": "MD-W",
                "EndOfLine": true
              },
              {"Name": "Hanson Park",
                "MetraCode": "HANSONPK",
                "lon": 41.9156248,
                "lat": -87.7669122,
                "Line": "MD-W"
              },
              {"Name": "River Grove",
                "MetraCode": "RIVERGROVE",
                "lon": 41.9311579,
                "lat": -87.8358024,
                "Line": "MD-W"
              },
              {"Name": "Franklin Park",
                "MetraCode": "FRANKLIN",
                "lon": 41.9365237,
                "lat": -87.8664304,
                "Line": "MD-W"
              },
              {"Name": "Bensenville",
                "MetraCode": "BENSENVIL",
                "lon": 41.9569118,
                "lat": -87.9421065,
                "Line": "MD-W"
              },
              {"Name": "Wooddale",
                "MetraCode": "WOODDALE",
                "lon": 41.9625,
                "lat": -87.975278,
                "Line": "MD-W"
              },
              {"Name": "Itasca",
                "MetraCode": "ITASCA",
                "lon": 41.9716194,
                "lat": -88.0142844,
                "Line": "MD-W"
              },
              {"Name": "Medinah",
                "MetraCode": "MEDINAH",
                "lon": 41.978056,
                "lat": -88.050833,
                "Line": "MD-W"
              },
              {"Name": "Roselle",
                "MetraCode": "ROSELLE",
                "lon": 41.9811076,
                "lat": -88.067464,
                "Line": "MD-W"
              },
              {"Name": "Schaumburg",
                "MetraCode": "SCHAUM",
                "lon": 41.9890906,
                "lat": -88.1178247,
                "Line": "MD-W"
              },
              {"Name": "Elgin",
                "MetraCode": "ELGIN",
                "lon": 42.0609034,
                "lat": -88.3281216,
                "EndOfLine": true,
                "Line": "MD-W"
              }
          ];

exports.GetLocationByMetraCode = function(line, code) {
    var foundStop = null;
    exports.Locations.forEach(function(stop) {
        if(line === stop.Line) {
           if (code === stop.MetraCode) {
                foundStop = stop;
           }
        }
    });
    return foundStop;
 };



exports.UserTrips = {
      "jpdicosola": {
          DefaultLine: "MD-W",
          DefaultLocation: exports.GetLocationByMetraCode("MD-W", "SCHAUM"),
          DefaultTrip: {
                Origin: exports.GetLocationByMetraCode("MD-W", "SCHAUM"),
                Destination: exports.GetLocationByMetraCode("MD-W", "CUS")
          }
      }
    };

