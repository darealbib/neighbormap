import React, { Component } from 'react';
import './App.css';
import scriptLoader from 'react-async-script-loader';
import { styledMap } from './styledMap.js';
import { places } from './places.js';
import {CLIENT_ID} from './keys.js'
import {CLIENT_SECRET} from './keys.js'
import {MAPS_KEY} from './keys.js'
import FilterPlaces from './FilterPlaces.js'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      "map": "",
      "spots": places,
      "infowindow":""
    };

    this.initMap = this.initMap.bind(this);
    this.infoWindowOpener = this.infoWindowOpener.bind(this);
  }

  componentDidMount() {
    window.initMap = this.initMap;
  }

  //Initialise Google map
  initMap() {
    var self = this;
    // creating a new map
    //from official google maps documentation
    var map = new window.google.maps.Map(document.getElementById("map"), {
      center: {lat: 21.251384, lng: 81.629641},
      zoom: 13,
      styles:styledMap
    });

    var infoWindow = new window.google.maps.InfoWindow();
    var boundries = new window.google.maps.LatLngBounds();
    // blank array for all spots
    var spots = [];
    // each spot gets a marker
    this.state.spots.forEach((spot) => {
      var marker = new window.google.maps.Marker({
        position: spot.spot,
        map: map,
        title:spot.name,
        animation: window.google.maps.Animation.DROP,
      });
      marker.setIcon('http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+'0000ff'+'|40|_|%E2%80%A2');
      // event when the marker is clicked
      marker.addListener("click", function() {
        self.infoWindowOpener(marker);
      });
      boundries.extend(marker.position);
      spot.marker = marker;
      // pushing spot to the array
      spots.push(spot);
    });
    map.fitBounds(boundries);

    this.setState({
      map:map,
      infowindow: infoWindow,
      spots: spots
    });
  }

// opens the infowindow when clicked on the marker
  infoWindowOpener(marker) {
    //close other infowindow when a new marker is clicked
    this.state.infowindow.close();
    this.state.spots.forEach((spot) => {
      spot.marker.setAnimation(null);
    })

    //animations
    if (marker.getAnimation() !== null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(window.google.maps.Animation.BOUNCE);
    }

    //put the marker at the center of the map
    this.state.map.setCenter(marker.getPosition());

    this.state.infowindow.setContent('Getting information from Foursquare.');

    //getting data from foursquare
    var self = this;
    var url = "https://api.foursquare.com/v2/venues/search?client_id="
     + CLIENT_ID +
      "&client_secret=" +
       CLIENT_SECRET +
       "&v=20130815&ll=" +
       marker.getPosition().lat() +
       "," +
       marker.getPosition().lng() +
        "&limit=1";

    fetch(url)
      .then(function(response) {
        if (response.status !== 200) {
          var errorMessage = "Information from foursquare couldn't be loaded";
          self.state.infowindow.setContent(errorMessage);
          return;
        }

        //if repose succeeds get the data in the variables to display in infowindow
        response.json().then(function(data){
          var place_data = data.response.venues[0];
          var placeName, placeAddress, placeId, placeCheckin;
          if(place_data.name) {
            placeName =  place_data.name;
          }
          if(place_data.location.formattedAddress[0]) {
            placeAddress =  place_data.location.formattedAddress[0];
          }
          if(place_data.id) {
            placeId =  place_data.id;
          }
          if(place_data.stats.checkinscount) {
            placeCheckin=  place_data.stats.checkinsCount;
          }

          //format in which infoWindow Details are displayed
          var infoWindowDetails = `<h1 class="place-name">${placeName}</h1>
                             <hr>
                             <h2 class="place-address">Address:</h2>
                             <p class="place-addressDetail">${placeAddress}</p>
                             <hr>
                             <h2 class="place-checkin">Number of CheckIns:${placeCheckin}</h2>
                             <a class="place-readmore" href="https://foursquare.com/v/${placeId}" target="_blank">Follow on <strong>Foursquare Website</strong></a>
                            `
          self.state.infowindow.setContent(infoWindowDetails);
        });
      })
      .catch(function(err) {
        //throw error in case data couldn't be loaded
        var errorMessage = "Information from foursquare couldn't be loaded";
        self.state.infowindow.setContent(errorMessage);
      });

    this.state.infowindow.open(this.state.map, marker);

  //marker is clear when closed
    this.state.infowindow.addListener('closeclick',function(){
      self.state.infowindow.setMarker = null;
    });
  }

  render() {
    return (
      <div role="main">
        <FilterPlaces spots={this.state.spots} infowindow={this.state.infowindow} infoWindowOpener={this.infoWindowOpener}/>
        <div id="map" role="application"></div>
      </div>
    );
  }
}

export default scriptLoader(
    [`https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&v=3&callback=initMap`]
)(App);
