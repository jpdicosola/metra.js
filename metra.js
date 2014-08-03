var request = require('request');
var async = require('async');
var config = {};
var TripDataProvider = require('./metra-lines');
var moment = require('moment-timezone');

TrainDirection = {
  Inbound: 0,
  Outbound: 1
}

function getRequest(stationRequest)
{
  return {
    uri: 'http://12.205.200.243/AJAXTrainTracker.svc/GetAcquityTrainData',
    method: 'POST',
    json: {
      stationRequest: stationRequest
    }
  };
}

function parseDate(dt)
{
  return dt != null ? new Date(parseInt(dt.substr(6))) : null;
}

var MINIMUM_DATE = new Date("Mon Jan 01 1900 00:00:00 GMT-0600 (CST)").getTime();

function add_train(train, train_list)
{
  var est = parseDate(train.estimated_dpt_time);
  var sch = parseDate(train.scheduled_dpt_time);
  var minsLate = ((est.getTime() - sch.getTime()) / 1000) / 60;

  tripInfo = {};
  tripInfo["departureTime"] = est.toJSON();
  tripInfo["minutesLate"] = minsLate;
  tripInfo["number"] = train.train_num;
  
  if (tripInfo != null && est.getTime() != MINIMUM_DATE)
  {
    train_list.push(tripInfo);
  }
}

function getAnnocement(line, callback)
{
  var url = "http://metrarail.com/content/metra/en/home/jcr:content/trainTracker.serviceannouncements.html?trackerIndex=0&trainLineId=" + line;

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      parseHTML(body);
    }
  });
}

function parseHTML(html)
{
  var cheerio = require('cheerio'),
    $ = cheerio.load(html);

    console.log($('.trainTrackerServiceAnnouncementsContent a').text());
}

function request_train_data(jsonRequest, callback)
{
  console.log(jsonRequest);
  request(jsonRequest, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      jsonData = JSON.parse(body.d);

      try
      {
      var depart_times = [];

      add_train(jsonData.train1, depart_times);
      add_train(jsonData.train2, depart_times);
      add_train(jsonData.train3, depart_times);

      var hash = {};

      depart_times.forEach(function(train) {
        time = moment.tz(new Date(train.departureTime), "America/Chicago")._i;
        var date = new Date(time.getFullYear(), time.getMonth(), time.getDate()).toISOString();
        hash[date] = hash[date] || [];
        hash[date].push(train);
      });
      
      callback(hash);

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
}

exports.get_alerts = function(options, callback) {
  var jsonRequest;
};

exports.get_times = function(options, callback) {
  console.log(options);
  getAnnocement(options.Line,null);

  SetUserOptions(options);
  var requests = BuildJsonRequests(options);

  if (requests.mainTripRequest)
  {
    async.parallel({
      arrivalTrip: function(rqstCallback){
          request_train_data(requests.arrivalTripRequest, function (result){
            rqstCallback(null, result);
          });
      },
      trip: function(rqstCallback){
          request_train_data(requests.mainTripRequest, function (result){
            rqstCallback('null', result);
        });
      }
    },
    function(err, results) {
        SetArrivingTrains(results.trip, results.arrivalTrip);
        console.log(results);
        results.trip.tripInfo = {Origin: options.Origin, Destination: options.Destination, Line: options.Line};
        callback(null, results.trip);
    });

  }
  else
  {
    callback("Invalid request");
  }

}

function SetArrivingTrains(trip, arrivalTrip)
{
  if (!arrivalTrip)
  {
    console.log('Arrival Trip not found!');
    return;
  }
  else
  {
    console.log('Arrival Trip:');
    console.log(arrivalTrip);
  }
  Object.keys(trip).forEach(function (key) { 
            var trainList = trip[key]
            trainList.forEach(function(t) {
                var arrival = FindByNumber(arrivalTrip, t.number);
                if (arrival) t.arrivalTrain = arrival;
            });
        });
}

function FindByNumber(trip, number)
{
  var matchingTrain = null;
  Object.keys(trip).forEach(function (key) { 
            var trainList = trip[key]
            trainList.forEach(function(t) {
                if (t.number === number)
                {
                    matchingTrain = t;
                }
            });
        });
        return matchingTrain;
}

function GetArrivalTripInfo(tripInfo) {
    arrivalTripInfo = {};
    arrivalTripInfo.Origin = tripInfo.Destination;
    var direction = getTravelDirection(tripInfo);
    arrivalTripInfo.Destination = getEndOfLineStop(direction).MetraCode;
    return arrivalTripInfo;
}

function getTravelDirection(tripInfo) {
    var locations = TripDataProvider.Locations;
    var i = 0;
    var OriginIdx = 0;
    var destIdx = 0;
    locations.forEach(function(stop) {
        if(stop.Line === tripInfo.line) {
           if (tripInfo.Origin == stop.MetraCode) {
              OriginIdx = i;
           }
           if (tripInfo.Destination === stop.MetraCode) {
              destIdx = i;
           }
        }

        i++;
    });
    return OriginIdx > destIdx ? TrainDirection.InBound : TrainDirection.Outbound;
}

function getEndOfLineStop(direction) {
   return direction === TrainDirection.Outbound ? TripDataProvider.Locations[TripDataProvider.Locations.length-1]: TripDataProvider.Locations[0];
};

function SetUserOptions(options) {
    if(options.User) {
     var userTrip = TripDataProvider.UserTrips[options.User];
     if(userTrip) {
        options.Line = userTrip.DefaultLine;
        if (options.Direction === 'ib') {
            options.Origin = userTrip.DefaultLocation.MetraCode;
            options.Destination = getEndOfLineStop(TrainDirection.Inbound).MetraCode;
        }
        else {
            options.Origin = getEndOfLineStop(TrainDirection.Inbound).MetraCode;
            options.Destination = userTrip.DefaultLocation.MetraCode;
        }
     }
  }
}

function BuildJsonRequests(options) {
  var requests = {};
  if(options.Line && options.Origin && options.Destination) {
      var tripInfo= getRequest({
          Corridor: options.Line,
          Destination: options.Destination,
          Origin: options.Origin
        });
        tripInfo.Origin = options.Origin;
        tripInfo.Destination = options.Destination;
        tripInfo.Line = options.Line;
        requests.mainTripRequest = tripInfo;
  }
  var arrivalTripInfo = GetArrivalTripInfo(options);
  requests.arrivalTripRequest = getRequest({
           Corridor: options.Line,
           Destination: arrivalTripInfo.Destination,
           Origin: arrivalTripInfo.Origin
        });
  console.log(requests);
  return requests;
}