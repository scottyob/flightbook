import React, { useState, useEffect, useContext } from "react";

import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

const GETLAUNCHES = gql`
  {
    sitesWithName(name: "") {
      data {
        name
        latitude
        longitude
      }
      after
      before
    }
  }
`;

function LaunchesTable() {
  const { data, error, loading } = useQuery(GETLAUNCHES);

  if (!loading) {
    console.log(data);
    console.log(error);
  }

  return <div>Some table goes here</div>;
}

export default LaunchesTable;
