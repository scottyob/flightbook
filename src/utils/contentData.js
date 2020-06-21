import React from "react";

import LaunchesCount from "../components/LaunchesCount";

const contentData = [
  {
    title: "Contribute",
    link: "https://github.com/scottyob/flightbook",
    description:
      "FlightBook is compleatly open source.  Feel free to check it out, develop " +
      "it more, submit a pull request.  Everyone wins!",
    icon: ["fab", "github"],
  },
  {
    title: "View Launches",
    link: "/launches/",
    description: <LaunchesCount />,
    icon: "rocket",
  },
];

export default contentData;
