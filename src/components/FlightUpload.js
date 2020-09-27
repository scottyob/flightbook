import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

import React, { useState } from "react";
import Files from "react-files";

const IGCParser = require("igc-parser");
const GeoLocation = require("geolocation-utils");

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

function FindLaunch({ lat, long }) {
  const { data, error, loading } = useQuery(GETLAUNCHES, {
    variables: { lat, long },
  });

  alert(data);
}

var onFilesChange = function (files, setFiles) {
  setFiles("Files!!");
  return;
  while (files.length > 0) {
    // Parse the IGC file.
    var reader = new FileReader();
    reader.onload = function (evt) {
      if (evt.target.readyState != 2) return;
      if (evt.target.error) {
        alert(evt.target.error);
        return;
      }

      // TODO:  Find out how to upload these to the datastore.
      let fileContent = evt.target.result;
      let parsed = IGCParser.parse(fileContent);

      let fix = parsed.fixes[0];
      var launch = FindLaunch(fix.latitude, fix.longitude);
      debugger;
    };

    var file = files.pop();
    reader.readAsText(file);
  }
};

function distanceTo(launch, fix) {}

function FlightUploader(props) {
  const [flightSubmitter, setFlightSubmitter] = useState(null);
  const [location, setLocation] = useState(null);

  let fix = props.igc.fixes[0];
  const { data, error, loading } = useQuery(GETLAUNCHES, {
    variables: { lat: fix.latitude, long: fix.longitude },
  });

  if (data && !location) {
    const center = { lat: fix.latitude, lon: fix.longitude };
    var sorted = data.findLaunch.sort((a, b) => {
      return (
        GeoLocation.distanceTo(center, { lat: a.latitude, lon: a.longitude }) -
        GeoLocation.distanceTo(center, { lat: b.latitude, lon: b.longitude })
      );
    });
    if (sorted.length > 0) {
      setLocation(sorted[0]);
    }
  }

  return (
    <li>
      {props.name}...{location?.name}...{flightSubmitter}
    </li>
  );
}

function readAsAsync(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve(IGCParser.parse(reader.result));
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
    let filenames = [];
    files.forEach((f) => {
      promises.push(readAsAsync(f));
      filenames.push(f.name);
    });
    Promise.all(promises).then((igcs) => {
      igcs.forEach((igc, i) => {
        components.push(<FlightUploader igc={igc} name={filenames[i]} />);
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
