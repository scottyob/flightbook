import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";

import PrivateRoute from "./components/PrivateRoute";
import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import LogBook from "./views/LogBook";
import NotFound from "./views/NotFound";
import Launch from "./views/Launch";
import Launches from "./views/Launches";
import Profile from "./views/Profile";
import { useAuth0 } from "./react-auth0-spa";
import history from "./utils/history";
import Properties from "./utils/properties";

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
  const { loading, user } = useAuth0();

  if (loading) {
    return <Loading />;
  }

  const client = new ApolloClient({
    uri: "https://graphql.fauna.com/graphql",
    request: (operation) => {
      console.log("Doing operation");
      let token = "";
      if (!loading && user) {
        token = user["https://faunadb.com/id/secret"];
      } else {
        token = Properties.public_key;
      }
      console.log("Secret is " + token);
      operation.setContext({
        headers: {
          authorization: token ? `Bearer ${token}` : "",
        },
      });
    },
  });

  return (
    <ApolloProvider client={client}>
      <Router history={history}>
        <div id="app" className="d-flex flex-column h-100">
          <NavBar />
          <Container className="flex-grow-1 mt-5">
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/logbook/" exact component={LogBook} />
              <Route path="/launches/" exact component={Launches} />
              <Route
                path="/launch/:slug"
                strict
                sensitive
                render={({ match }) => {
                  return match ? <Launch /> : <NotFound />;
                }}
              />
              <PrivateRoute path="/profile" component={Profile} />
            </Switch>
          </Container>
          <Footer />
        </div>
      </Router>
    </ApolloProvider>
  );
};

export default App;
