/**
 * This file contains all components used for the sequencing of recording data 
 * and the interaction with each set of bars for each note. 
 * This code has been adapted from the week 7/8 contact. 
 */
import Template from "./Template";
import { guitar, piano, tonePart } from "../data/instruments.js";
import { useState, useEffect } from "react";
import fetch from 'node-fetch';
const notes = ["C3","D3","E3","F3","G3","A3","B3"];
const notes_read = ["C","D","E","F","G","A","B"]


/**
 * The component of each individual bar cell of the sequence. 
 * Sets different class toggle on click.
 */
function Bar({ barID, barEnabled, handleBarClick}) {
    
    function barSelected() {
        if (barEnabled) {
            return "toggle-selected";
        }
        return "toggle";
    }

    return (
        <button className= {barSelected()}  onClick={handleBarClick}></button>
    );

}

/**
 * A component comprised of 16 bar components, making up the sequence of one note. 
 * params - 
 * [sequence, setSequence] - used to control the recording data, for adding and removing to the sequence pattern
 * toneObject, instrumentType - used to generate a new tonePart for each added note 
 * note - the string of the note to be created, eg "C3", "B3" etc. 
 */
function Bars({ sequence, setSequence, toneObject, instrumentType, note }) {
    function sortSequence(bar, otherBar) {
        if (bar.barID < otherBar.barID) {
            return -1;
        }
        if (bar.barID > otherBar.barID) {
            return 1;
        }
        return 0;
    }

    function handleBarClick(bar, instrumentType) {
      const now = toneObject.now();
      instrumentType.triggerAttackRelease(note, "8n", now);
      let filteredSequence = sequence.filter((_bar) => _bar.barID !== bar.barID);
      setSequence([ ...filteredSequence, { ...bar, barEnabled: !bar.barEnabled } ]);
    }

    return sequence.sort(sortSequence).map(bar => <Bar key={bar.barID} barEnabled={bar.barEnabled} handleBarClick={() => handleBarClick(bar, instrumentType)} />);
}

/**
 * The component used to control the Bars of the sequence, to send the recording data to the tonePart for playback, and to return the data to the 
 * main recording data component. 
 */
function Sequencer({ toneObject, instrumentType, note="G3", data, setData}) {
    const noteName = note;
    const noteIndex = notes.findIndex(note => note === noteName);

    const noteData = data[noteIndex][notes_read[noteIndex]];
    const default_data = [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false];
    //convert noteData into a sequnece - ordered by bars etc. 
    
    //initialise the sequence with the default data - either the id or empty. 
    let initialSequence = []
    for(let bar = 0; bar < 16; bar++) {
        initialSequence.push({
            barID: bar,
            barEnabled: noteData[bar]
        });
    }
    const [sequence, setSequence] = useState(initialSequence);
    //console.log(sequence);
    const [rerender, setRerender] = useState(false);
    

    //because the data is initially recording_data_default and then changes to the fetched data, 
    //we need to do a refresh in order for the actual data to load!
    //when sequence changes, update the recording data itself. 
    useEffect( () => {
        //console.log(sequence);
        data[noteIndex][notes_read[noteIndex]] = sequence.map(a=> a.barEnabled); //This should use setData. Too bad!
    }, [sequence])
    
    return (
        <>
        <div class="toggle-row-container">
            <div class="row-label">
                <h4>{note}</h4>
            </div>
            <div className="sequence-row-container">
                <Bars sequence={sequence} setSequence={setSequence} toneObject={toneObject} instrumentType={instrumentType} note = {note} />        
            </div>

        </div>
           
        </>
    );
}

export default Sequencer;