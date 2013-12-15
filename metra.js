var request = require('request');

var config = {};

config.options = {
  uri: 'http://12.205.200.243/AJAXTrainTracker.svc/GetAcquityTrainData',
  method: 'POST',
  json: {
    "stationRequest": {
    	"Corridor": "MD-W",
        "Destination": "SCHAUM",
        "Origin": "CUS",
        "timestamp": "/Date(1386273708784-0000)/"
    }
  }
};

function parse_date(date)
{
  return new Date(parseInt(date.substr(6)));
}

function print_train(train)
{
  sch = parse_date(train.scheduled_dpt_time);
  est = parse_date(train.estimated_dpt_time);
  if (est > new Date())
  {
	  if (est.getTime() !== sch.getTime())
	  {
	    console.log(est + "*"); //Indiate train is late
	  }
	  else
	  {
	    console.log (sch);
	  }
  }
  else 
  {
  	//No train available; service will return an date of Jan 01 1900
  }
}

request(config.options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    jsonData = JSON.parse(body.d);

    try
    {

      console.log("Upcoming Trains:\n")

      print_train(jsonData.train1);
      print_train(jsonData.train2);
      print_train(jsonData.train3);

    }
    catch(e)
    {
      console.log ("Error Parsing JSON Data: "  + e);
      console.log(jsonData);
    }
  }
  else
  {
  	console.log(error);
  }
});