import React from "react"
import ReactLoading from "react-loading"
import "../App.css"

const Header = (props) => {
    const toggleLogin = () => {   
        if (!props.user.loggedIn) {
            window.location.href="http://catchthatflow.com:9000/spotify/login"  // consider useHistory hook
        }
        else {
            props.setUser({
                name: "Guest",
                profilePic: "",
                playlists: [],
                loggedIn: false,
                accessToken: "",
                fetched: false,
            })
            props.setState({
                fetched: false,
                analyzed: false,
            })
            props.setSongSelection("")
            props.setSelection({
                playlist: {
                    name: "",
                    songs: [],
                }
            })
        }
    }

    return (
        <>
        <div className="Row">
            <div className="RowItem" style={{"justifyContent": "flex-start", "marginLeft": "5%"}}>
                <div className="Source">
                    <div className="Info">
                        <button 
                            className="HeaderButton"
                            onClick={() => {window.location.href="https://github.com/gholmes829/Flow"}}
                        >
                            Source
                        </button>
                    </div>
                </div>
            </div>
            <div className="RowItem">
                <div className="Title">Flow</div>
            </div>
            <div className="RowItem" style={{"justifyContent": "flex-end", "marginRight": "5%"}}>
                <div className="Login">
                    {
                        props.user.fetched && !props.user.loggedIn ?
                            <div style = {{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-evenly",
                                width: "100%"
                            }}>
                                
                                <div style={{
                                    width: "50px",
                                }}>
                                    <ReactLoading type={"cylon"} height={"100%"} width={"100%"} />
                                </div>
                            </div>
                        :
                        <>
                        <div className="Info">
                            <button className="HeaderButton" onClick={toggleLogin}>{!props.user.loggedIn ? "Login" : "Logout"}</button>
                        </div>
                        <div className="Info"
                        
                        style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}
                        
                        >{
                                !props.user.fetched && !props.user.loggedIn  ?
                                    "Guest"
                                :
                                "\"" + props.user.name + "\""
                            }
                        </div>
                        <div className="Info">
                        {props.user.profilePic === ""
                            ? <img className="ProfilePic" src="/assets/unknown.jpg" alt="Unknown Pic"></img>
                            : <img className="ProfilePic" src={props.user.profilePic} alt="Profile Pic"></img>}
                        </div>
                        </>
                    }
                </div>
            </div>
        </div>
        </>
    )
}

export default Header;