import React, { useState } from 'react';
import axios from 'axios';

import './SongDisplay.css';

export default function SongDisplay(props) {
    const [ user, setUser ] = useState("");

    const [ albumArt, setAlbumArt ] = useState("");
    const [ track, setTrack ] = useState("");
    const [ artist, setArtist ] = useState("");

    const Connection = {
        NOT_CONNECTED: 0,
        CONNECTED: 1
    }
    const [ activeConnection, setActiveConnection ]
          = useState(Connection.NOT_CONNECTED);

    const twitch = window.Twitch ? window.Twitch.ext : null;

    const streamURL = window.location.href.slice(8);
    const streamer = streamURL.slice(streamURL.indexOf('/') + 1,
                                     streamURL.indexOf('?'));

    twitch.rig.log("song display created. Streamer name is "
                   + streamer
                   + " and URL is "
                   + streamURL);

    const URLBuilder = {
        base: 'https://134.122.27.64',
        join: '/join/',
        nowPlaying: '/nowplaying/',
        disconnect: '/disconnect/',
        reconnect: '/reconnect/',
        leave: '/leave/',
        getUser: '/getuser/'
    };

    const NowPlaying = () => {
        return (
            <span className="sp-now-playing">
              <img id="album-art" src={albumArt} />
              <div className="text-info">
                <h3>{track}</h3>
                <h4>{artist}</h4>
              </div>
              <div className="button-controls">
                <button className="disconnect" type="button">Disconnect</button>
              </div>
            </span>
        );
    };

    const LoginPrompt = () => {
        return (
            <div className="login-prompt">
              <h1>Login to Spotify</h1>
              <button type="button" onClick={join}>Login</button>
            </div>
        );
    }

    function getSpotifyUser() {
        const response = axios.get(URLBuilder.base
                                   + URLBuilder.getUser, {user: props.userId})
                              .then(() => {
                                  setUser(response.data.user);
                              }).catch((error) => twitch.rig.log(error));
    }

    function getCurrentSong() {
        const response = axios.get(URLBuilder.base
                                   + URLBuilder.nowPlaying
                                   + streamer, {user: user})
                              .then(() => {
                                  setAlbumArt(response.data.albumArt);
                                  setArtist(response.data.artist);
                                  setTrack(response.data.track);
                              }).catch((error) => twitch.rig.log(error));
    }

    function join() {
        const response = axios.get(URLBuilder.base
                                   + URLBuilder.join
                                   + streamer, {user: props.userId})
                              .then(() => {
                                  if (response.status === 200) {
                                      setActiveConnection(Connection.CONNECTED);
                                  }
                                  getSpotifyUser();
                                  setInterval(() => {
                                      twitch.rig.log("Get current song");
                                      getCurrentSong();
                                  }, 3000);
                              })
                              .catch((error) => twitch.rig.log(error));
    }

    if (activeConnection === Connection.NOT_CONNECTED) {
        return <LoginPrompt />;
    } else {
        return <NowPlaying />;
    }
}