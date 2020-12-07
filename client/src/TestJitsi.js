import React, { useEffect, useState} from 'react'

function TestJitsi(props) {
    const [API, setAPI] = useState();

    const domain = 'easyflip.repositorium.cl';

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://easyflip.repositorium.cl/external_api.js";
        script.async = true;
        script.onload = ()=>{ 
            const options ={
                roomName: 'EasyFlipAPIExample',
                width: 700,
                height: 700,
                parentNode: document.getElementById('jitsi')
            };
            const newapi = new window.JitsiMeetExternalAPI(domain, options);
            //console.log('api' + newapi);
            setAPI(newapi);
        };
        document.body.appendChild(script);
      return () => {
          document.body.removeChild(script);
        }
      }, []);
    

    return (
    <div id='jitsi' height='700' >

    </div>);
}

export { TestJitsi };