import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import React from "react";

import Table from "./Table";

const GET_FLIGHTS = gql`
  query FindAllFlights {
    allFlights(_size: 10) {
      data {
        _id
        location
      }
    }
  }
`;

const FlightsList = () => {
  // Loads up flights for a given user
  return <Table query={GET_FLIGHTS} />;

  const { data, error, loading } = useQuery(GET_FLIGHTS);

  if (loading) {
    return <div>Loading Flights...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  let items = data.allFlights.data.map((v, i) => {
    return <li key={i}>{v.location}</li>;
  });
  return <ul>{items}</ul>;
};

export default FlightsList;
