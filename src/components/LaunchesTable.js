import React from "react";

import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import TableQL from "react-tableql";

const GETLAUNCHES = gql`
  query Launch($name: String!) {
    sitesWithName(name: $name) {
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

function LaunchesTable({ name }) {
  //return <ApolloTableQL query={GETLAUNCHES} variable={{ name: "Ed" }} />;

  const { data, error, loading } = useQuery(GETLAUNCHES, {
    variables: { name },
  });

  if (loading) {
    return <div>Loading</div>;
  }
  if (error && error.message.includes("Insufficient privileges")) {
    return <div>Please Login to perform searches</div>;
  }

  console.log(data.sitesWithName.data);
  return <TableQL data={data} />;
}

export default LaunchesTable;
