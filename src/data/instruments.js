/**
 * Handles all main tone.js components, including initialising the instruments used for playback. 
 * 
 * toneTransport - used to operate the playback of the sample
 * tonePart - used to add/remove notes to the Tone object
 *      specified with a (type) argument, to create a tonePart that plays with a particular type of instrument
 */
import * as Tone from "tone";

export const toneObject = Tone;

export const toneTransport = toneObject.Transport;

export const tonePart = (type) => new toneObject.Part((time, note) => {
    type.triggerAttackRelease(note, "8n", time);
}, []).start(0);

/**
 * Guitar instrument
 */
export const guitar = new toneObject.Sampler({
urls: {
"F3": "F3.mp3",
"F#3": "Fs3.mp3",
"G3": "G3.mp3",
"G#3": "Gs3.mp3",
"A3": "A3.mp3",
"A#3": "As3.mp3",
"B3": "B3.mp3",
"C3": "C3.mp3",
"C#3": "Cs3.mp3",
"D3": "D3.mp3",
"D#3": "Ds3.mp3",
"E3": "E3.mp3",
},
release: 1,
baseUrl: "/samples/guitar-acoustic/"
}).toDestination();

/**
 * Piano instrument
 */
export const piano = new toneObject.Sampler({
    urls: {
    "F3": "F3.mp3",
    "F#3": "Fs3.mp3",
    "G3": "G3.mp3",
    "G#3": "Gs3.mp3",
    "A3": "A3.mp3",
    "A#3": "As3.mp3",
    "B3": "B3.mp3",
    "C3": "C3.mp3",
    "C#3": "Cs3.mp3",
    "D3": "D3.mp3",
    "D#3": "Ds3.mp3",
    "E3": "E3.mp3",
    },
    release: 1,
    baseUrl: "/samples/piano/"
    }).toDestination();
      

/**
 * French Horn instrument 
 */
export const frenchhorn = new toneObject.Sampler({
    urls: {
    "G2": "G2.mp3",
    "A1": "A1.mp3",
    "A3": "A3.mp3",
    "C2": "C2.mp3",
    "C4": "C4.mp3",
    "D3": "D3.mp3",
    "D5": "D5.mp3",
    "F3": "F3.mp3",
    "F5": "F5.mp3",
    },
    release: 1,
    baseUrl: "/samples/french-horn/"
    }).toDestination();

/**
 * Drum instrument
 */
    export const drums = new toneObject.Sampler({
        urls: {
        "C3": "drums1.mp3",
        "D3": "drums2.mp3",
        "E3": "drums3.mp3",
        "F3": "drums4.mp3",
        "G3": "drums5.mp3",
        "A3": "drums6.mp3",
        "B3": "drums7.mp3"
        },
        release: 1,
        baseUrl: "/samples/drums/"
        }).toDestination();