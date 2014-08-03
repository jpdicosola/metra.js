metra.js
========

## What is it?
Provides real time depart times for Chicago's Metra lines for the next three upcoming trains. Each train will also return a corresponding arrival train. This is will provide real-time arrival information.

## Usage

The API works by passing a line, origin and destination. Locations are specified using the "MetraCode" which is an abbrivated name (see meta_data for examples). Currently the MD-W line is supported but other lines should work by updating the metra_data.js file. A trip for a specific user can also be retrieved by providing a user name and direction of travel. The user name and trip info would need to be added to the UserTrips array in metra_data.js.

## Todo

Service alerts are a work in progress. This will return any delay or cancellations coresponding to the requested line.

Add additional line data.