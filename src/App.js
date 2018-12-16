import React, { Component } from 'react';
import "./App.css";
const ColorInfo= (props)=>{
  return (
    <div>
      <div>{props.hsl}</div>
      <div>{props.hsv}</div>
      <img alt="color" src={props.image} />
    </div>
  );
}


class App extends Component {
  state={
    hex: "FFFFFF",
    componentState: "Ready",
    colorData: {}
  }

  fetchColor = (color, signal) => {
    fetch(`http://www.thecolorapi.com/id?hex=${color}`, { signal })
      .then(response => {
        this.setState({componentState: "Fetching"});
        return response.json();
      })
      .then(res => {

        this.setState({
          colorData: res,
          componentState: "Success"
        })

      })
      .catch(err => {
        this.setState({componentState: "Error"})
      });
  }


  componentDidMount(){
    this.controller = this.getAbortController();
    this.abortSignal = this.controller.signal;
    this.fetchColor(this.state.hex, this.abortSignal);
  }
  componentDidUpdate(){
    if (this.state.componentState === "Ready" && this.state.colorData.hex.clean !== this.state.hex.toUpperCase() && this.state.hex.length ===6){
    this.controller = this.getAbortController();
    this.abortSignal = this.controller.signal;
    this.fetchColor(this.state.hex, this.abortSignal);
    }
  }
  componentWillUnmount(){
    this.controller.abort();
  }

  getAbortController = ()=> {
    const controller = new AbortController();
    return controller;
  }

  controller = {};

  handleChange = (e)=> {
    if (/^[a-fA-F\d]{6}$/.test(e.target.value)) {
      this.setState({componentState:"Ready"});
    }
    this.setState({hex: e.target.value});
  };

  render() {
    let content = this.state.colorData.hsl ?   <ColorInfo
        hsl={this.state.colorData.hsl.value}
        hsv={this.state.colorData.hsv.value}
        image={this.state.colorData.image.bare}
      /> : null;

    if (this.state.componentState === "Fetching") {
      content = <div>Loading...</div>;
    } else if (this.state.componentState === "Success") {
      content = (
        <ColorInfo
          hsl={this.state.colorData.hsl.value}
          hsv={this.state.colorData.hsv.value}
          image={this.state.colorData.image.bare}
        />
      );
    } else if (this.state.componentState === "Error") {
      content = <div>Connection failed</div>;
    }



    return (
      <div className="App">
        <div>
        <input value={this.state.hex} onChange={this.handleChange} />
        {content}
        </div>
      </div>
    );
  }
}

export default App;
