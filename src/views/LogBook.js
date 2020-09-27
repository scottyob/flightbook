import React from "react";
import FlightUpload from "../components/FlightUpload";
import { useAuth0 } from "../react-auth0-spa";

const Page = () => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();

  if (!isAuthenticated) {
    return <div>Create a new user or login to view your logbook</div>;
  }

  return (
    <div>
      <div>{FlightUpload()}</div>
      <div>Flight History Goes Here</div>
    </div>
  );
};

export default Page;
