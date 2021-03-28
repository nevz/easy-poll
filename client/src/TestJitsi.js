import React, { useEffect, useState} from 'react'

function TestJitsi(props) {
    const [API, setAPI] = useState({});

    const [roomName, setRoomName] = useState("easyFlipExample1");


    const domain = 'easyflip.repositorium.cl';

    useEffect(() => {
      
      try {
        document.getElementById('jitsi').removeChild((document.getElementById("jitsiConferenceFrame0")));
      } catch (error) {
        console.log(error)
      }
        var script = document.createElement('script');
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = ()=>{ 
            const options ={
                roomName: roomName,
                width: 700,
                height: 500,
                parentNode: document.getElementById('jitsi')
            };
            const newapi = new window.JitsiMeetExternalAPI(domain, options);
            setAPI(newapi);
        };
        document.body.appendChild(script);
      return () => {
          document.body.removeChild(script);
        }
      }, [roomName]);
    

    function sendMessage(event){
      console.log('hola');
      const participants = API.getParticipantsInfo();
      for(const participant of participants){
        console.log(participant);
      }
    } 

    function changeRoom(){
      setRoomName("FlipTestNewRoomName");
    }

    function openPollDialog(){

    }

    return (
    <div>
        <div id='jitsi' height='700' ></div>
        <button onClick={sendMessage}>Send</button>
        <button onClick={changeRoom}>New Room</button>

    </div>
    );
}

export { TestJitsi };