var GeoMap = {

	position : null,
	
	latLngUser : null,
	
	locationOptions : {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	},
	
	mapOptions : {
		center : null,
		mapTypeControls : true,
		zoom: 16,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	},
	
	placeRequestOptions : {
		location : null,
		radius: 100,
		types: ['store']
	},
	
	init:function(){
		this.getLocation();
	},
	getLocation:function() {
		boundGetLocationSuccess = $.proxy(this.getLocationSuccess,GeoMap);
		boundGetLocationError = $.proxy(this.getLocationError,GeoMap);
		console.log(boundGetLocationSuccess);
		
		navigator.geolocation.getCurrentPosition(boundGetLocationSuccess, boundGetLocationError, this.locationOptions);
	},
	getLocationSuccess:function(position) {
		latLngUser = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		this.position = position;
		this.latLngUser = latLngUser;
		this.handleLocationSuccess(this.latLngUser);
	},
	handleLocationSuccess : function(latLngUser){
		this.mapOptions.center = this.latLngUser;
		this.placeRequestOptions.location = this.latLngUser;
		this.computeDistanceToTarget(this.latLngUser);
		this.createMap(this.latLngUser);
	},
	getLocationError:function(error) {
		alert("geolocation not supported!!");
	},
	computeDistanceToTarget:function(latLngUser){
		this.latLngTarget = new google.maps.LatLng(34.157131, -118.485042);
		var distanceUserToTarget = google.maps.geometry.spherical.computeDistanceBetween(latLngUser, this.latLngTarget);
		this.isTargetInRange(distanceUserToTarget);
	},
	isTargetInRange:function(distanceUserToTarget){
		var distanceRange = 1000;
		var distanceRounded = Math.round(distanceUserToTarget);
		if (distanceUserToTarget>distanceRange) {
			$("#info").append('You are not within 1 kilometer of Bovitz Inc.\n You are ' + distanceRounded + ' meters away');//In metres
		}
		else {
			$("#info").append('You are within 1 kilometer of the Bovitz Inc.\n You are ' + distanceRounded + ' meters away');
		}
	},
	createMap:function(latLngUser) {
		var target = document.getElementById('map');
		this.map = new google.maps.Map(target, this.mapOptions);
		this.addTargetMarker(map);
		this.addUserMarker(map);
		this.requestPlaces(map);
		this.setBounds();
	},
	addTargetMarker:function() {
		var pin_image = 'http://brgsurvey.com/svy/asa1/misc/kaleidoscope1.png'
		targetMarker = new google.maps.Marker({
			position: this.latLngTarget,
			map: this.map,
			title: 'Bovitz HQ',
			icon: pin_image,
			zIndex: 9999
		});
	},
	addUserMarker:function() {
		var pin_image = 'http://brgsurvey.com/svy/asa1/misc/icon_green.png'
		UserMarker = new google.maps.Marker({
			position: this.latLngUser,
			map: this.map,
			title: 'You are here',
			icon: pin_image,
			zIndex: 9999
		});
	},
	requestPlaces : function() {
		var service = new google.maps.places.PlacesService(this.map);
		service.nearbySearch(this.placeRequestOptions, this.handlePlaces);
	},
	handlePlaces : function(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0; i < results.length; i++) {
		  this.addPlacesMarker(results[i]);
		  this.addInfoWindows(results[i]);
		}
	}
	},
	addPlacesMarker : function(place) {
		var placeLocation = place.geometry.location;
		placeMarker = new google.maps.Marker({
			map: this.map,
			position: placeLocation,
			title: place.name
		});
	
	},
	addInfoWindows : function(place) {
		infowindow = new google.maps.InfoWindow();
		google.maps.event.addListener(placeMarker, 'click', function(){
			infowindow.setContent(place.name);
			infowindow.open(this.map, this);
		});
	},
	setBounds : function() {
    var bounds = new google.maps.LatLngBounds();
    bounds.extend(this.latLngUser);
    bounds.extend(this.latLngTarget);
    this.map.fitBounds(bounds);
	}
	
};
var boundGeoMapInit = $.proxy(GeoMap.init,GeoMap);

$(document).ready(boundGeoMapInit);