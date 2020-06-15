import React, { Component } from "react";
import Props from "../utils/properties";

var faunadb = require("faunadb"),
  q = faunadb.query;

class LaunchesCount extends Component {
  constructor(props) {
    super(props);

    this.state = { records: null };
    this.countNode = React.createRef();
  }

  componentDidMount() {
    // Connect to the DB and get the number of launches
    var client = new faunadb.Client({
      secret: Props.public_key,
    });

    client.query(q.Call(q.Function("total_launches"))).then((ret) => {
      this.setState({ records: ret.toLocaleString() });
    });
  }

  componentDidUpdate() {
    //this.render();
  }

  render() {
    const { records } = this.state;

    return (
      <div>
        Our launches database contains <strong>{records}</strong> launches from{" "}
        <a href="http://www.paraglidingspots.com/">ParaglidingSpots.</a>
      </div>
    );
  }
}

export default LaunchesCount;
