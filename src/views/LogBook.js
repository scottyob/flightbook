import React from "react";
import FlightUpload from "../components/FlightUpload";
import { useAuth0 } from "../react-auth0-spa";
import Table from "../components/Table";
import { gql } from "apollo-boost";

const GET_FLIGHTS = gql`
  query FindAllFlights($size: Int) {
    allFlights(_size: $size) {
      data {
        _id
        location
        maxVerticleHeightMeters
        durationMin
        totalDistanceTravelledKm
        maxDistanceFromLaunchKm
        gliderType
      }
    }
  }
`;

const Page = () => {
  const { isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return <div>Create a new user or login to view your logbook</div>;
  }

  return (
    <div>
      <div>{FlightUpload()}</div>
      <hr />
      <div>
        <Table query={GET_FLIGHTS} />;
      </div>
    </div>
  );
};

export default Page;
