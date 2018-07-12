import React, { Component } from 'react';

class FilterPlaces extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterSpots: ""
    };
    this.filterPlaces = this.filterPlaces.bind(this);
  }

  componentWillMount() {
    this.setState({
      filterSpots: this.props.spots
    });
  }

// filters spots dynamically according to the user input
  filterPlaces(event) {
    this.props.infowindow.close();
    this.props.spots.forEach((spot) => {
      spot.marker.setAnimation(null);
    })

    // new array for filtering of spots
  	var filterSpots = [];

  // spot which match input visible rest are hidden
    this.props.spots.forEach((spot) => {
      if (spot.name.toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) {
        spot.marker.setVisible(true);
        filterSpots.push(spot);
      }
     else {
        spot.marker.setVisible(false);
      }
    });
    this.setState({
    	filterSpots: filterSpots
    });
  }
	render() {

		return (
			<div className="main-filter-container" role="search" >
        <h1>Raipur Explorer</h1>
          <div className="input-filter-bar">
            <label>Filter</label>
            <input
              role="search"
              aria-labelledby="input-box"
              id="input-box"
              type="text"
              placeholder="Place name"
              onChange={this.filterPlaces}
            />
          </div>
        <ul className="filter-list">
          {this.state.filterSpots.map((spot) => (
            <li
              key={spot.name}
              role="button"
              tabIndex="0"
              onKeyPress={() => this.props.infoWindowOpener(spot.marker)}
              onClick={() => this.props.infoWindowOpener(spot.marker)}
            >
              {spot.name}
            </li>
          ))}
        </ul>
			</div>
		)
	}
}

export default FilterPlaces;
