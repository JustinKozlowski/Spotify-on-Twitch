import React, { useState } from 'react';
import Authentication from '../../util/Authentication/Authentication';
import SongDisplay from '../SongDisplay';

import './App.css';

export default function App(){
    const [finishedLoading, setFinishedLoading] = useState(false);
    const [theme, setTheme] = useState('light');
    const [isVisible, setIsVisible] = useState(true);

    Authentication = new Authentication();

    // if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null.
    twitch = window.Twitch ? window.Twitch.ext : null;

    contextUpdate(context, delta){
        if(delta.includes('theme')){
            setTheme(context.theme);
        }
    }

    visibilityChanged(visibility){
        setIsVisible(visibility);
    }

    componentDidMount(){
        if(twitch){
            twitch.onAuthorized((auth)=>{
                Authentication.setToken(auth.token, auth.userId);
                if(!finishedLoading){
                    // if the component hasn't finished loading (as in we've not set up after getting a token), let's set it up now.

                    // now we've done the setup for the component, let's set the state to true to force a rerender with the correct data.
                    setFinishedLoading(true);
                }
            })

            twitch.listen('broadcast',(target,contentType,body)=>{
                twitch.rig.log(`New PubSub message!\n${target}\n${contentType}\n${body}`);
                // now that you've got a listener, do something with the result... 

                // do something...

            })

            twitch.onVisibilityChanged((isVisible,_c)=>{
                visibilityChanged(isVisible);
            })

            twitch.onContext((context,delta)=>{
                contextUpdate(context,delta);
            })
        }
    }

    componentWillUnmount(){
        if(twitch){
            twitch.unlisten('broadcast', ()=>console.log('successfully unlistened'));
        }
    }
    
    render(){
        if(finishedLoading && isVisible) {
            return (
                <div class="SongDisplay">
                  <SongDisplay />
                </div>
            )
        } else {
            return (
                <div class="SongDisplay">
                </div>
            );
        }
    }
}
