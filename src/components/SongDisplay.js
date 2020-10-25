import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './SongDisplay.css';

export default function SongDisplay(props) {
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
        base: 'fronk.justinkozlowski.me:8888',
        join: '/join/',
        nowPlaying: '/nowplaying/',
        disconnect: '/disconnect/',
        reconnect: '/reconnect/',
        leave: '/leave/'
    };

    const NowPlaying = (props) => {
        return (
            <span class="sp-now-playing">
              <img id="album-art" src={props.albumArt} />
              <div class="text-info">
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
              <h2>You've left the party. See you again soon!</h2>
            </div>
        )
    }

    async function join(streamer) {
        const response = await axios.get(URLBuilder.base
                                         + URLBuilder.join
                                         + streamer)
                                    .catch((error)
                                           => console.log(error));
        setUser(response.data.user);
    };

    async function getCurrentSong(streamer) {
        const response = await axios.get(URLBuilder.base
                                         + URLBuilder.nowPlaying
                                         + streamer, {user: user});
        setAlbumArt(response.data.albumart);
        setArtist(response.data.artist);
        setTrack(response.data.track);
    }

    switch (status) {
        case statuses.NOT_CONNECTED:
            return <LoginPrompt />;
            break;
        case statuses.CONNECTED:
            return <NowPlaying
                     albumArt={albumArt}
                     track={track}
                     artist={artist}
                   />;
            break;
        case statuses.USER_DISCONNECTED:
            return <NowPlaying
                     albumArt={albumArt}
                     track={track}
                     artist={artist}
                   />;
            break;
        case statuses.LEFT:
            return <LeftConfirmation />;
            break;
    }
    
    setTimeout(getCurrentSong, 3000);
}
