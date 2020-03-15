import React, {useEffect, useState, useRef, MutableRefObject} from 'react';
import wsock from 'websocket-stream';
import through from "through2";

//import './Websocket.module.scss';

function WebSocketStream() {

    const streamRef: MutableRefObject<wsock.WebSocketDuplex | undefined> = useRef(undefined);
    //const inputRef: MutableRefObject<HTMLInputElement | undefined> = useRef(undefined);

    const [ output, setOutput ] = useState('');
    const [ inputValue, setInputValue ] = useState("");

    useEffect(() => {
        streamRef.current = wsock('ws://' + window.location.host);

        if(streamRef.current === undefined) throw new Error("No STREAM");

        streamRef.current.pipe(through((buf, enc, next) => {
            //output.push(buf.toString());
            //console.log("PIPE ", buf.toString());
            setOutput(buf);
            next();
        }));

        //console.log(streamRef.current);

        streamRef.current.on('end', () => {
            console.log("STREAM END");
        });
        streamRef.current.on('finish', () => {
            console.log("STREAM FINISH");
        })
        streamRef.current.on('error', () => {
            console.log("STREAM ERROR");
        })
        streamRef.current.on('close', () => {
            console.log("STREAM CLOSE");
        }) 
    }, []);

    const onSubmit = (event: any) => {
        event.preventDefault();
        //console.log(`Input value - ${inputValue}`);
        if(streamRef.current === undefined) throw new Error("No STREAM");
        streamRef.current.write(inputValue + "\n");
    };

    const onInputChange = (event: any) => {
        setInputValue(event.target.value);
    };

    return (
        <div>
            <form onSubmit={onSubmit}>
                <input type="text" name="msg" onChange={onInputChange} value={inputValue} />
            </form>
            <pre>{output}</pre>
        </div>
    );
}

export default WebSocketStream;