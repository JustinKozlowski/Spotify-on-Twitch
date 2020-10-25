import React from 'react'
import Authentication from '../../util/Authentication/Authentication'
import SongDisplay from '../SongDisplay/SongDisplay'
import { nanoid } from 'nanoid'

import './App.css'

export default class App extends React.Component{
    constructor(props){
        super(props)
        this.Authentication = new Authentication()

        //if the extension is running on twitch or dev rig, set the shorthand here. otherwise, set to null. 
        this.twitch = window.Twitch ? window.Twitch.ext : null
        this.state={
            finishedLoading:false,
            theme:'light',
            isVisible:true
        }
    }

    contextUpdate(context, delta){
        if(delta.includes('theme')){
            this.setState(()=>{
                return {theme:context.theme}
            })
        }
    }

    visibilityChanged(isVisible){
        this.setState(()=>{
            return {
                isVisible
            }
        })
    }

    componentDidMount(){
        if(this.twitch){
            this.twitch.onAuthorized((auth)=>{
                this.Authentication.setToken(auth.token, auth.userId)
                if(!this.state.finishedLoading){
                    // if the component hasn't finished loading (as in we've not set up after getting a token), let's set it up now.
                    // now we've done the setup for the component, let's set the state to true to force a rerender with the correct data.
                    this.setState(()=>{
                        return {finishedLoading:true}
                    })
                }
            })

            this.twitch.listen('broadcast',(target,contentType,body)=>{
                this.twitch.rig.log(`New PubSub message!\n${target}\n${contentType}\n${body}`)
                // now that you've got a listener, do something with the result... 

                // do something...

            })

            this.twitch.onVisibilityChanged((isVisible,_c)=>{
                this.visibilityChanged(isVisible)
            })

            this.twitch.onContext((context,delta)=>{
                this.contextUpdate(context,delta)
            })
        }
    }

    componentWillUnmount(){
        if(this.twitch){
            this.twitch.unlisten('broadcast', ()=>console.log('successfully unlistened'))
        }
    }
    
    render(){
        this.twitch.rig.log("finished: "
                            + this.state.finishedLoading
                            + " visible: "
                            + this.state.isVisible)
        const userId = nanoid()
        return (
            <div className="song-display">
              <SongDisplay userId={userId}/>
            </div>
        )
        // if(this.state.finishedLoading && this.state.isVisible){
        //     this.twitch.rig.log("Inside")
        // }else{
        //     this.twitch.rig.log("Nothing happened.");
        //     return (
        //         <div className="App">
        //           <h1>There's nothing here...</h1>
        //         </div>
        //     )
        // }

    }
}