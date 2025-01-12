/**
 * Component that is used by the create NEW sample page. 
 * This component handles the creation and interpretation of the recording data, 
 * as well as the preview of the song via the toneObject. 
 * When saved, a new entry to the samples api is added. 
 */
import Template from "../components/Template";
import Sequencer from "../components/Sequencer";
import { guitar, piano, frenchhorn, drums } from "../data/instruments.js";
import { useState, useEffect } from "react";
import fetch from 'node-fetch';
import { getSample, CreateSample, OverwriteSample} from '../components/Requests';

const APIKEY = 'jZtIMtZy2G';
const baseURL = 'https://comp2140.uqcloud.net/api/';
const notes = ["C3","D3","E3","F3","G3","A3","B3"];
const noteNames = ["C", "D", "E", "F","G","A","B"];


//default constants 
var recording_data_empty = [
            {'C': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
            {'D': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
            {'E': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
            {'F': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
            {'G': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
            {'A': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
            {'B': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]}
];

var recording_data_default = [
    {'C': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
    {'D': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
    {'E': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
    {'F': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
    {'G': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
    {'A': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]},
    {'B': [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]}
];


/**
 * Button component for the instrument selection. Rendered for 4 instruments - piano, guitar, french horn and drums. 
 * When clicked, sets the toggled instrument and switches the instrument object used in the tonePart. 
 */
function InstrumentButton( {barEnabled, instrumentName, instrument_type, setType} ) { 
    function barSelected() {
        if (barEnabled) {
            return "toggle-selected";
        }
        return "toggle";
    }
    function handleInstrumentClick() {
        setType(instrument_type);
    }
    return ( 
        <>
        <button className= {barSelected()} onClick={handleInstrumentClick}>{instrumentName}</button> 
        </>
    ); 
  } 

/**
 * Function to send the current recording data and sample name to the create sample fetch.
 * @param {*} saved_data - object containing all sample information - name, instrument type, save data
 * @returns 
 */
function SaveSample(saved_data) {
    const [name, setName] = useState("");
    function getInstrumentName() {
        const typeObj = saved_data["type"];
        if (typeObj === guitar) {
            return "guitar";
        } else if (typeObj === piano) {
            return "piano";
        } else if (typeObj === frenchhorn) {
            return "frenchhorn";
        } else if (typeObj === drums) {
            return "drums";
        }
    }
    function handleClick() {
        //console.log(saved_data);
        CreateSample(getInstrumentName(), name, Object.values(saved_data));
        alert("Saved Sample");
    }   

    return (
        <>
        <input
            type="Song Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
        <div class="button-group-container">
            <button type="button" class="bright-button" onClick={handleClick}>Save</button>
        </div>
        </>
    )
}

/**
 * Helper component used to iterate through all notes used and create a Sequence component for each note. 
 */
function Sequences( {toneObject, toneTransport, instrumentType, data, setData} ) {
   
    return notes.map(note => <Sequencer toneObject={toneObject} toneTransport={toneTransport} instrumentType={instrumentType} note={note} data={data} setData={setData}/>)

}


/**
 * Component used to control the preview button.
 * All preview operations are performed in the tonePart object in the main component. 
 * This component only handles the feedback of the current previewing status, as well as to reset the 
 * toneObject when clicked. 
 */
export function Preview({ previewing, setPreviewing, toneObject, toneTransport }) {
    function handleButtonClick() {
        toneObject.start();
        toneTransport.stop();

        if(previewing) {
            setPreviewing(false);
            console.log("Preview stopped manually.");
        }
        else {
            setPreviewing(true);
            console.log("Preview started.");
            toneTransport.start();
        }
    }

    return <button type="button"onClick={handleButtonClick}>{previewing ? "Stop Previewing" : "Preview"}</button>;
}
var dataReady = false;

/**
 * The main component of the Create page
 * toneObject, toneTransport and tonePart are used for the previewing of the sample. 
 * tonePart is also used to create a sound feedback when a note is clicked
 */
export default function Music({ toneObject, toneTransport, tonePart, id=null}) {
    //console.log(dataReady);
    const [data, setData] = useState(recording_data_default); //set the data to a default dataset. If no data is fetched, this data will be used.
    const [instrumentType, setType] = useState(piano); //set the instrument to a default instrument. If no data is fetched, this instrument will be used. 

    useEffect(() => {
        //get the initial instrument saved in the recording data. 
        function getInstrument(type_string) {
                if (type_string === "piano") {
                    return piano;
                } else if (type_string === "guitar") {
                    return guitar;
                } else if (type_string === "frenchhorn") {
                    return frenchhorn;
                } else if (type_string === "drums") {
                    return drums;
                } else {
                    return guitar;
                }
            }
        
        //get the recording data from the saved samples api list. 
        async function fetchRecordingData() {
            if (id) {
                const data_string = (await getSample(id))["recording_data"];
                const type_string = (await getSample(id))["type"];
                const data_JSON = JSON.parse(data_string);
                //console.log(type_string);
                setData(data_JSON);
                setType(getInstrument(type_string));
            } else {
                setData(recording_data_empty);
                setType(guitar);
            }
        }
        fetchRecordingData();
        dataReady = true; //used to avoid race condition
    },[]);

    const initialPreviewing = false;
    const [previewing, setPreviewing] = useState(initialPreviewing);

    //update the preview tonePart object recursively, to check for changes to the sample data
    useEffect(() => {

        tonePart(instrumentType).clear();
        toneTransport.cancel();


        data.forEach((note, noteIndex) => note[noteNames[noteIndex]].forEach((beat, beatnum) => {
        if (beat) {
            tonePart(instrumentType).add(beatnum/4, notes[noteIndex])
            }
        }));


        toneTransport.schedule(time => {
            setPreviewing(false);
            console.log("Preview stopped automatically")
        }, 16/4)
    });

    if (dataReady) {
    return (
        <Template title="Edit Sample">
            <form class="card edit-card">
                <SaveSample saved_data = {data} id = {id} type={instrumentType} setType={setType}/>   
                <Preview toneObject={toneObject} toneTransport={toneTransport} previewing={previewing} setPreviewing={setPreviewing}/>
            </form> 
            <div class="toggle-row-container">
                <div class="row-label">
                    <h4>Instrument</h4>
                 </div>
                <div class="sequence-row-container">
                    <InstrumentButton barEnabled={instrumentType===guitar} instrumentName="Guitar" instrument_type={guitar} setType={setType}/>
                    <InstrumentButton barEnabled={instrumentType===piano} instrumentName="Piano" instrument_type={piano} setType={setType}/>
                    <InstrumentButton barEnabled={instrumentType===frenchhorn} instrumentName="French Horn" instrument_type={frenchhorn} setType={setType}/>
                    <InstrumentButton barEnabled={instrumentType===drums} instrumentName="Drums" instrument_type={drums} setType={setType}/>
                </div>
            </div>
            <Sequences toneObject={toneObject} toneTransport={toneTransport} instrumentType={instrumentType} data={data} setData ={setData}/>
        </Template>
    );
    } else {
        return (
            <Template title="Edit Sample">
                <form class="card edit-card">
                    <SaveSample saved_data = {data} type={instrumentType}/>   
                    <Preview toneObject={toneObject} toneTransport={toneTransport} previewing={previewing} setPreviewing={setPreviewing}/>
                </form> 
                <div class="toggle-row-container">
                    <div class="row-label">
                        <h4>Instrument</h4>
                     </div>
                    <div class="sequence-row-container">
                        <InstrumentButton barEnabled={true} instrumentName="Guitar"/>
                        <InstrumentButton barEnabled={false} instrumentName="Piano"/>
                        <InstrumentButton barEnabled={false} instrumentName="French Horn"/>
                        <InstrumentButton barEnabled={false} instrumentName="Drums"/>
                    </div>
                </div>
            </Template>
        );
    }
}
                
