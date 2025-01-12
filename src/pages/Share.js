/**
 * The Component used for the Share page for each saved sample
 */

import React from "react";
import Template from "../components/Template";
import { getSample, getLocations, setLocationShare, sampleToLocation, getSampleToLocation, deleteSampleToLocation } from '../components/Requests';
import { useState, useEffect } from "react";
//import { Preview } from "../pages/Create";
import { guitar, piano, frenchhorn, drums } from "../data/instruments.js";

const notes = ["C3","D3","E3","F3","G3","A3","B3"];
const noteNames = ["C", "D", "E", "F","G","A","B"];

/**
 * Preview component of the sample. Basically the same as the component in the Create page. (Should probably just export/import that component...)
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
 * The component used to render the current sample of the share page - includes links to edit and preview the sample.
 */
export function SongTemplateShare( { previewing, setPreviewing, toneObject, toneTransport, sampleName, dateCreated, id}) {
    return (
        <section class="sample">
            <div class="card">
                <div class="song-details">
                    <h3>{sampleName}</h3>
                    <p>{dateCreated}</p>
                </div>
                <div class="button-group-container">
                    <a href= {`/${id}`} class="bright-button">Edit</a>
                    <Preview toneObject={toneObject} toneTransport={toneTransport} previewing={previewing} setPreviewing = {setPreviewing}/>
                </div>
            </div>
        </section>
    )
    }

/**
 * Tempalate used for each location that is set to "sharing" in the /api/location/ list. 
 * For each location stored in the api: 
 *      - check to see if the location is being shared. 
 *          - if it is, render the template 
 *          - search the /api/sampletolocation/ list to find any matches for the current locationId and the current sampleId
 *              - if there is, set the location toggle to true
 * 
 * The share/not share buttons perform two actions: 
 *      - The Share button creates a PUT request to add a new entry to the list, storing the apikey, locationid and sampleid
 *      - the Not Shared button creates a DELETE request. This request searches for any entries in the list with a matching 
 *          locationID and sampleID and removes them. 
 */
function LocationTemplate( {locationData, locationName, shared, sampleID}) {
    const [sharedSamples, setSharedSamples] = useState(false);

    //update the shared status of the sample each time the state changes 
    useEffect( () => {
        async function getSampleShares() {
            const data_string = await getSampleToLocation();
            var this_sample_shares = data_string.filter(item => item.sample_id === sampleID && item.location_id === locationData["id"]);
            if (this_sample_shares.length !== 0) {
                setSharedSamples(true);
            }
        }
        getSampleShares();
    },[sharedSamples]);

    //local share used to toggle format
    function isShared() {
        if (sharedSamples) {
            return "toggle-selected";
        }
        return "toggle";
    }
    function isNotShared() {
        if (!sharedSamples) {
            return "toggle-selected";
        }
        return "toggle";
    }

    //click share/not share needs to either add or remove to api
    async function  handleShareClick() {
        //await setLocationShare(locationData, true);
        await sampleToLocation(locationData["id"], sampleID)
        setSharedSamples(true);
    }

    async function handleNotShareClick() {
        await deleteSampleToLocation(sampleID, locationData["id"]);
        setSharedSamples(false);
    }

    if (shared) { //only render template if location is shared (in /api/location)
    return (
        <div class="toggle-row-container">
        <div class="location-name-label">
            <h4>{locationName}</h4>
        </div>
        <div class="sequence-row-container">
            <button class={isShared()} onClick={handleShareClick}>Shared</button>
            <button class={(isNotShared())} onClick={handleNotShareClick}>Not Shared</button>
        </div>
    </div>
    )
    }
}
//            {

var all_locations = await getLocations();
var data_ready = false; //used to prevent race conditions when fetching the sample data. Otherwise, the tonePart will be empty 


/**
 * The main component of the Share page. A unique share page is generated for each saved sample. 
 * The address of the share page for each sample is /share/{id}
 * 
 * Sharing data is fetched and modified in the LocationTemplate component, not the main component. 
 * This could be improved by fetching once in the main component, however multiple fetches need to be 
 * performed anyway to check the share status each time it changes. 
 */
export default function Page2({ tonePart, toneObject, toneTransport, id}) {
    const [sample,setSample] = useState(false);
    const [previewing, setPreviewing] = useState(false);

    //get sample data
    useEffect( () => {
        async function getThisSample() {
            const data_string = await getSample(id);
            setSample(data_string);
        }
        getThisSample();
        setSample(sample);
        data_ready=true;
    }, []);

    //get recording data for preview
    useEffect( () => {

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

        //setup the tonePart for the sample to preview it. 
        //unlike the Create page, the sample cannot change from this page. So, we can just 
        //create the tonePart once and play the preview when necessary. 
        if (sample["recording_data"]) {
            var record = JSON.parse(sample["recording_data"])
            var type = getInstrument(sample["type"]);

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
        },)

    if (data_ready) { 
    return (
        <Template title="Share This Sample">
            <SongTemplateShare previewing={previewing} setPreviewing={setPreviewing} toneObject={toneObject}
            toneTransport={toneTransport} sampleName={sample["name"]} dateCreated={sample["datetime"]} id={id} locations={all_locations}/>
            {all_locations.map(item => <LocationTemplate locationData={item} locationName={item.name} shared={item.sharing} sampleID={sample["id"]} />)}
        </Template>
    );}
}
            