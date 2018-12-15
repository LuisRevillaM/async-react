import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const ColorInfo= (props)=>{
  return (
    <div>
      <div>{props.hsl}</div>
      <div>{props.hsv}</div>
      <img alt="color image" src={props.image} />
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
    this.controller = this.asyncLoad();
  }
  componentDidUpdate(){
    if (this.state.componentState === "Ready"){
      this.controller = this.asyncLoad();

    }
  }
  componentWillUnmount(){
    this.controller.abort();
  }

  controller = {};

  asyncLoad = ()=>{
    const myController = new AbortController();
    const mySignal = myController.signal;
    this.fetchColor(this.state.hex, mySignal);

    return myController;
  }

  handleChange = (e)=> {
    if (/^[a-fA-F\d]{6}$/.test(e.target.value)) {
      this.setState({componentState:"Ready"});
    }
    this.setState({hex: e.target.value});
  };

  render() {
    let content = null;

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
        <input value={this.state.hex} onChange={this.handleChange} />
        {content}
      </div>
    );
  }
}

export default App;
