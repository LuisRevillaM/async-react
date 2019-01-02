import React, { Component } from "react";
import "./App.css";
const ColorInfo = props => {
  return (
    <div>
      <div>{props.hsl}</div>
      <div>{props.hsv}</div>
      <img alt="color" src={props.image} />
    </div>
  );
};

class App extends Component {
  state = {
    color: "FFFFFF",
    status: "Ready",
    colorData: {}
  };

  componentDidMount() {
    this.controller = this.getAbortController();
    this.abortSignal = this.controller.signal;
    this.fetchColor(this.state.color, this.abortSignal);
  }
  componentDidUpdate() {
    if (
      this.state.status === "ready" &&
      this.state.colorData.hex.clean !== this.state.color.toUpperCase() &&
      this.state.color.length === 6
    ) {
      this.controller = this.getAbortController();
      this.abortSignal = this.controller.signal;
      this.fetchColor(this.state.color, this.abortSignal);
    }
  }
  componentWillUnmount() {
    this.controller.abort();
  }

  stateReducer = (state, action) => {
    switch (action.type) {
      case "input":
        return Object.assign(state, { color: action.payload });
      case "ready":
        return Object.assign(state, { status: "ready" });
      case "fetch":
        return Object.assign(state, { status: "loading" });
      case "success":
        return Object.assign(state, {
          status: "done",
          colorData: action.payload
        });
      case "failure":
        return Object.assign(state, { status: "error" });
      default:
        return state;
    }
  };

  dispatch = action => {
    const newState = this.stateReducer(this.state, action);
    this.setState(newState);
  };

  getAbortController = () => {
    const controller = new AbortController();
    return controller;
  };

  controller = {};

  handleChange = e => {
    if (/^[a-fA-F\d]{6}$/.test(e.target.value)) {
      this.dispatch({ type: "ready", payload: e.target.value });
    }
    this.dispatch({ type: "input", payload: e.target.value });
  };

  startFetchFlow = function*(color, signal) {
    const data = yield fetch(`http://www.thecolorapi.com/id?hex=${color}`, {
      signal
    }).then(response => {
      this.dispatch({ type: "fetching" });
      return response.json();
    });

    this.dispatch({ type: "success", payload: data });
  };

  fetchColor = (color, signal) => {
    const followFetchFlow = this.startFetchFlow(color, signal);
    const futureColor = followFetchFlow.next().value;
    const doWhenData = value => {
      followFetchFlow.next(value);
    };
    futureColor.then(doWhenData);
  };

  render() {
    let content = this.state.colorData.hsl ? (
      <ColorInfo
        hsl={this.state.colorData.hsl.value}
        hsv={this.state.colorData.hsv.value}
        image={this.state.colorData.image.bare}
      />
    ) : null;

    if (this.state.status === "loading") {
      content = <div>Loading...</div>;
    } else if (this.state.status === "success") {
      content = (
        <ColorInfo
          hsl={this.state.colorData.hsl.value}
          hsv={this.state.colorData.hsv.value}
          image={this.state.colorData.image.bare}
        />
      );
    } else if (this.state.status === "error") {
      content = <div>Connection failed</div>;
    }

    return (
      <div className="App">
        <div>
          <input value={this.state.color} onChange={this.handleChange} />
          {content}
        </div>
      </div>
    );
  }
}

export default App;
