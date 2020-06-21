import React, { Component } from "react";

import { Row, Col } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import contentData from "../utils/contentData";

class Content extends Component {
  render() {
    return (
      <div className="next-steps my-5">
        <h2 className="my-5 text-center">Where to go from here?</h2>
        <Row className="d-flex justify-content-between">
          {contentData.map((col, i) => (
            <Col key={i} md={5} className="mb-4">
              <h6 className="mb-3">
                <Link to={col.link}>
                  <FontAwesomeIcon icon={col.icon || "link"} className="mr-2" />
                  {col.title}
                </Link>
              </h6>
              <div>{col.description}</div>
            </Col>
          ))}
        </Row>
      </div>
    );
  }
}

export default Content;
