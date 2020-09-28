import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useAuth0 } from "../react-auth0-spa";

import React, { useState, useEffect } from "react";
import Files from "react-files";

const IGCParser = require("igc-parser");
const GeoLocation = require("geolocation-utils");
const md5 = require("md5");

const GETLAUNCHES = gql`
  query FindLaunch($lat: Float!, $long: Float!) {
    findLaunch(latitude: $lat, longitude: $long) {
      _id
      name
      longitude
      latitude
    }
  }
`;

const INSERT_FLIGHT = gql`
  mutation InsertFlight($data: FlightInput!) {
    createFlight(data: $data) {
      _id
    }
  }
`;

// builds a flight to log.
function constructFlight(
  user,
  igc,
  raw_igc,
  launch_name,
  file_name,
  file_hash
) {
  let heights = igc.fixes.map((f) => {
    return f.gpsAltitude;
  });
  let fixLocations = igc.fixes.map((f) => {
    return { lat: f.latitude, lon: f.longitude };
  });

  let totalDistance = 0.0;
  let maxDistance = 0.0;
  fixLocations.forEach((f, i) => {
    if (i == 0) {
      return;
    }
    totalDistance =
      totalDistance + GeoLocation.distanceTo(fixLocations[i - 1], f);
    let launchDistance = GeoLocation.distanceTo(fixLocations[0], f);
    if (launchDistance > maxDistance) {
      maxDistance = launchDistance;
    }
  });

  let ret = {
    date: igc.date,
    location: launch_name,
    maxVerticleHeightMeters: Math.max(...heights) - Math.min(...heights),
    durationMin:
      (igc.fixes[igc.fixes.length - 1].timestamp - igc.fixes[0].timestamp) /
      1000 /
      60,
    totalDistanceTravelledKm: totalDistance / 1000,
    maxDistanceFromLaunchKm: maxDistance / 1000,
    gliderType: igc.gliderType,
    owner: {
      connect: user["https://user/id"],
    },
    fileHash: file_hash,
    fileName: file_name,
    igcFile: raw_igc,
  };
  return ret;
}

function FlightUploader(props) {
  const [addFlight, { data, error }] = useMutation(INSERT_FLIGHT);
  const { user } = useAuth0();
  const [state, setState] = useState(null);

  if (state == "Uploading" && data) {
    setState("DONE");
  }

  if (!state) {
    addFlight({
      variables: {
        data: constructFlight(
          user,
          props.igc,
          props.raw_igc,
          props.launchName,
          props.name,
          props.fileHash
        ),
      },
    });
    setState("Uploading");
  }

  return <span>{error?.message || state}</span>;
}

function FlightUploadManager(props) {
  const [flightInfo, setFlightInfo] = useState(null);

  let fix = props.igc.fixes[0];
  const { data, error, loading } = useQuery(GETLAUNCHES, {
    variables: { lat: fix.latitude, long: fix.longitude },
  });

  if (data && !flightInfo) {
    const center = { lat: fix.latitude, lon: fix.longitude };
    // Find the closest launch from those roughly in the same area
    var sorted = data.findLaunch.sort((a, b) => {
      return (
        GeoLocation.distanceTo(center, { lat: a.latitude, lon: a.longitude }) -
        GeoLocation.distanceTo(center, { lat: b.latitude, lon: b.longitude })
      );
    });
    if (sorted.length > 0) {
      setFlightInfo({
        location: sorted[0],
        uploader: (
          <FlightUploader
            igc={props.igc}
            raw_igc={props.raw_igc}
            name={props.name}
            launchName={sorted[0].name}
            fileHash={props.fileHash}
          />
        ),
      });
    }
  }

  return (
    <li>
      {props.name}...{flightInfo?.location?.name}...{flightInfo?.uploader}
    </li>
  );
}

function readAsAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve({
        name: file.name,
        igc: IGCParser.parse(reader.result),
        raw_igc: reader.result,
        fileHash: md5(reader.result),
      });
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function LogBook() {
  const [files, setFiles] = useState(null);
  const [loadedFiles, setLoadedFiles] = useState(null);
  const [fileUploaders, setFileUploaders] = useState(null);
  const [errors, setErrors] = useState(null);

  if (errors) {
    // Should probably make this look prettier, but whatever, probably won't get hit
    // (much)
    return <div>{errors}</div>;
  }

  // If the user has dropped files down, initialize the uploader components
  if (files && !loadedFiles) {
    let components = [];
    let promises = [];
    files.forEach((f) => {
      promises.push(readAsAsync(f));
    });
    Promise.all(promises).then((igcs) => {
      igcs.forEach((r) => {
        components.push(
          <FlightUploadManager
            key={r.name}
            igc={r.igc}
            raw_igc={r.raw_igc}
            name={r.name}
            fileHash={r.fileHash}
          />
        );
      });
      setFileUploaders(components);
      setLoadedFiles(true);
    });
  }

  if (fileUploaders) {
    return (
      <div>
        <ul>{fileUploaders}</ul>
      </div>
    );
  }

  return (
    <div className="files">
      <Files
        className="files-dropzone"
        onChange={(files) => {
          //onFilesChange(files, setFiles);
          setFiles(files);
        }}
        onError={(error) => {
          setErrors(error.message);
        }}
        accepts={[".igc"]}
        multiple
        maxFiles={300}
        maxFileSize={10000000}
        minFileSize={0}
        clickable={false}
      >
        Drag igc flight files here to upload
      </Files>
    </div>
  );
}

export default LogBook;
