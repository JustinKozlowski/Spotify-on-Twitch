import React, { useState } from 'react';
import axios from 'axios';

import './SongDisplay.css';

export default function SongDisplay(props) {
    const [ streamer, setStreamer ] = useState("");
    const [ activeConnection, setActiveConnection ]
          = useState(Connection.NOT_CONNECTED);

    const [ albumArt, setAlbumArt ] = useState("");
    const [ track, setTrack ] = useState("");
    const [ artist, setArtist ] = useState("");

    const Connection = {
        NOT_CONNECTED: 0,
        CONNECTED: 1,
        USER_DISCONNECTED: 2,
        LEFT: 3
    }

    const URLBuilder = {
        base: '134.122.27.64',
        join: '/join/',
        nowPlaying: '/nowplaying/',
        disconnect: '/disconnect/',
        reconnect: '/reconnect/',
        leave: '/leave/'
    };

    const NowPlaying = (props) => {
        return (
            <span className="sp-now-playing">
              <img id="album-art" src={props.albumArt} />
              <div className="text-info">
                <h3>{props.track}</h3>
                <h4>{props.artist}</h4>
              </div>
            </span>
        );
    };

    const LoginPrompt = () => {
        return (
            <div className="login-prompt">
              <h2>Login to Spotify to listen along!</h2>
              <button type="button" onClick={join}></button>
            </div>
        );
    }

    const LeftStream = () => {
        return (
            <div className="left-confirm">
              <h2>You&apos;ve left the party. See you again soon!</h2>
            </div>
        )
    }

    async function join() {
        const response = await axios.get(URLBuilder.base
                                         + URLBuilder.join
                                         + streamer, {user: props.userId})
                                    .catch((error) => console.log(error));

        if (response.status === 200) {
            setActiveConnection(Connection.CONNECTED);
        }
       
        setInterval(() => {
            window.Twitch.ext.rig.log("Get current song");
            getCurrentSong();
        }, 3000);
    }

    async function getCurrentSong() {
        const response = await axios.get(URLBuilder.base
                                         + URLBuilder.nowPlaying
                                         + streamer);
        setAlbumArt(response.data.albumArt);
        setArtist(response.data.artist);
        setTrack(response.data.track);
    }

    switch (activeConnection) {
        case Connection.NOT_CONNECTED:
            return <LoginPrompt />;
        case Connection.CONNECTED:
            return <NowPlaying
                     albumArt={albumArt}
                     track={track}
                     artist={artist}
                   />;
        case Connection.USER_DISCONNECTED:
            return <NowPlaying
                     albumArt={albumArt}
                     track={track}
                     artist={artist}
                   />;
        case Connection.LEFT:
            return <LeftStream />;
    }
}
