import React from "react";
import "../App.css";

const Header = (props) => {

    const changeUser = () => {
        props.setUser({
            name: "Guest",
            profilePic: "",
            playlists: [],
            loggedIn: false,
            accessToken: ""
        });
        console.log("Redirecting!")
        window.location.href="http://catchthatflow.com:9000/spotify/login"  // consider useHistory hook
        console.log("Done!")
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
                            Source Code
                        </button>
                    </div>
                </div>
            </div>
            <div className="RowItem">
                <div className="Title">Flow</div>
            </div>
            <div className="RowItem" style={{"justifyContent": "flex-end", "marginRight": "5%"}}>
                <div className="Login">
                    <div className="Info"><button className="HeaderButton" onClick={changeUser}>{!props.user.loggedIn ? "Login" : "Change"}</button></div>
                    <div className="Info">"{props.user.name}"</div>
                    <div className="Info">
                        {props.user.profilePic === ""
                            ? <img className="ProfilePic" src="/assets/unknown.jpg" alt="Unknown Pic"></img>
                            : <img className="ProfilePic" src={props.user.profilePic} alt="Profile Pic"></img>}
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}

export default Header;