import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './SongDisplay.css';

export default function SongDisplay(props) {
    const { auth } = props;
    const [ user, setUser ] = useState("");
    const [ status, setStatus ] = useState(0);

    const [ albumArt, setAlbumArt ] = useState("");
    const [ track, setTrack ] = useState("");
    const [ artist, setArtist ] = useState("");

    const URLBuilder = {
        base: 'fronk.justinkozlowski.me:8888',
        join: '/join/',
        nowPlaying: '/nowplaying/',
        disconnect: '/disconnect/',
        reconnect: '/reconnect/',
        leave: '/leave/'
    };

    const statuses {
        NOT_CONNECTED: 0,
        CONNECTED: 1,
        USER_DISCONNECTED: 2,
        LEFT: 3
    };

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
                                         + streamer);
        setAlbumArt(response.data.albumart);
        setArtist(response.data.artist);
        setTrack(response.data.track);
    }

    return (
        <div class="sp-now-playing">
          <img id="album-art" src={albumArt} />
          <div class="text-info">
            <h3>{track}</h3>
            <h4>{artist}</h4>
          </div>
        </div>
    );
}
