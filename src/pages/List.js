/**
 * The home page of the site, which lists all samples currently saved by the user.
 */
import React from "react";
import Template from "../components/Template";
import { useState, useEffect } from "react";
import { getSample, getSamples } from '../components/Requests';
import { guitar, piano, frenchhorn, drums } from "../data/instruments.js";

const APIKEY = 'jZtIMtZy2G';
const baseURL = 'https://comp2140.uqcloud.net/api/';

const notes = ["C3","D3","E3","F3","G3","A3","B3"];
const noteNames = ["C", "D", "E", "F","G","A","B"];

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

/**
 * Template used to display the sample information for each sample saved to the system. 
 * Includes buttons to link to the share and edit pages for the corresponding sample, as well as a preview button 
 * for the corresponding sample. 
 */
function SongTemplateShare( { tonePart, previewing, setPreviewing, toneObject, toneTransport, sampleName, dateCreated, id}) {
    const [sample,setSample] = useState(""); 

    //get the sample information (for the preview)
    useEffect( () => {
        async function getThisSample() {
            const data_string = await getSample(id);
            //console.log(data_string);
            setSample(data_string);
            //console.log(sample["id"] === id); 
        }
        getThisSample();
        setSample(sample);

        //set the instrument used for the preview (to be used by the tonePart)
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

        //check to ensure sample data is available, that sample data matches the corresponding sample 
        //and that there is not currently another preview being played. 
        //Update this each time the [sample] updates (ie when a new preview is selected)
        if (sample["recording_data"] && !previewing && sample["id"] === id) {
            var record = JSON.parse(sample["recording_data"])
            var type = getInstrument(sample["type"]);
            //console.log(record);

            tonePart(type).clear();
            toneTransport.cancel();


            record.forEach((note, noteIndex) => note[noteNames[noteIndex]].forEach((beat, beatnum) => {
            if (beat) {
                tonePart(type).add(beatnum/4, notes[noteIndex])
                }
            }));


            toneTransport.schedule(time => {
                setPreviewing(false);
                console.log("Preview stopped automatically")
                }, 16/4); 
            }
        
    }, [sample]);

    return (
        <section class="sample">
            <div class="card">
                <div class="song-details">
                    <h3>{sampleName}</h3>
                    <p>{dateCreated}</p>
                </div>
                <div class="button-group-container">
                    <a href= {id} class="bright-button">Edit</a>
                    <Preview toneObject={toneObject} toneTransport={toneTransport} previewing={previewing} setPreviewing = {setPreviewing}/>
                    <a href={`/share/${id}`}>Share</a>
                </div>
            </div>
        </section>
    )
    }

const all_samples = await getSamples();

export default function ListTemplate({ tonePart, toneObject, toneTransport }) {
    const [previewing, setPreviewing] = useState(false);
    return (
        <Template title="My Songs">
            <>
            {all_samples.map(item => 
                //<SongTemplate sampleName={item.name} dateCreated={item.datetime} id = {item.id} /> ) //non-previewing song template (old)
                <SongTemplateShare previewing={previewing} setPreviewing={setPreviewing} toneObject={toneObject} 
                toneTransport={toneTransport} tonePart={tonePart} sampleName={item.name} dateCreated={item.datetime} id = {item.id}/>)
            }
            <div class="create-card">
                <a href="create" class="full-button">Create Sample</a>
            </div>
            </>
        </Template>
    );
}
            