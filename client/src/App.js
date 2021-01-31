import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { };
    }

    //callAPI() {
    //    fetch("http://catchthatflow.com:9000")
    //        .then(res => res.text())
    //        .then(res => this.setState({ apiResponse: res }))
    //        .catch(err => err);
    //}

    //componentDidMount() {
    //    this.callAPI();
    //}

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">Welcome to React</h1>
                </header>
		<a href="http://catchthatflow.com:9000/spotify/login">Login</a>
		<a href="http://catchthatflow.com:9000/spotify/playlist">Playlist</a>
            </div>
        );
    }
}

export default App;
