import React, { useState } from "react";
import LaunchesTable from "../components/LaunchesTable";

// Launches view shows a list of launches.

function Launches() {
  const [input, setInput] = useState("");
  return (
    <>
      Search:{" "}
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        name="search"
        type="text"
      />
      <LaunchesTable name={input} />
    </>
  );
}

export default Launches;
