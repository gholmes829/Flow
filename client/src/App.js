import logo from './logo.svg';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { };
    }

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