/**
 * This file contains all node-fetch requests required for the application. 
 * These include: sample fetching (all samples and id-specific samples, save/overwrite), location fetching, sample-to-location fetching (save/delete)
 */
import React from "react";
import Template from "../components/Template";
import fetch from 'node-fetch';
import { useState, useEffect } from "react";

const APIKEY = 'jZtIMtZy2G';
const baseURL = 'https://comp2140.uqcloud.net/api/';

/**
 * Fetch request to create a NEW sample (does not have an existing id)
 * @param {*} saveInstrument - type of instrument to be saved as - will play as this instrument in previews
 * @param {*} saveName - name of the sample to save as 
 * @param {*} input_data - the recording data of the sample - required to build the tonePart for previewing 
 * @returns 
 */
export async function CreateSample(saveInstrument, saveName, input_data) {
    const url = `${baseURL}sample/?api_key=${APIKEY}`;
    const saveData = {
                    'type': saveInstrument, 
                    'name': saveName, 
                    'recording_data': JSON.stringify(input_data[0]),
                    'api_key': APIKEY
                 }

    const response = await fetch(url, {
        method: "POST",
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
  });
  const json = await response.json();
  return json;
}


/**
 * Fetch request to save an EXISTING sample (requires an existing sample id: the url used to make the PUT request is different 
 * to the one used to make the POST request for a new sample)
 * These could be mereged into one function by having a conditional url. 
 * @param {*} saveInstrument - type of instrument to be saved as - will play as this instrument in previews
 * @param {*} saveName - name of the sample to save as 
 * @param {*} input_data - the recording data of the sample - required to build the tonePart for previewing 
 * @returns 
 */
export async function OverwriteSample(saveInstrument, saveName, input_data) {
    //console.log(input_data[1]);
    const url = `${baseURL}sample/${input_data[1]}/?api_key=${APIKEY}`;
    //console.log(input_data);
    const saveData = {
                    'id' : input_data[1],
                    'type': saveInstrument, 
                    'name': saveName, 
                    'recording_data': JSON.stringify(input_data[0]),
                    'api_key': APIKEY
                 }

    const response = await fetch(url, {
        method: "PUT",
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(saveData)
  });
  const json = await response.json();
  return json;
}

/**
 * node-fetch request to return the sample data for a specific sample
 * Taken from contact class - week 7
 * @param {*} id - the id of the sample to be fetched
 * @returns 
 */
export async function getSample(id) {
    const url = `${baseURL}sample/${id}/?api_key=${APIKEY}`;
    const response = await fetch(url);
    const json = await response.json(); 
    return json;
}

/**
 * node-fetch request to return data of ALL samples 
 * Taken from contact class - week 7
 * @returns 
 */
export async function getSamples() {
    const url = `${baseURL}sample/?api_key=${APIKEY}`;
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

/**
 * Request to return all locations in api
 * Used in Share page to create Location components for each location in list.
 * @returns 
 */
export async function getLocations() {
    const url = `${baseURL}location/?api_key=${APIKEY}`;
    const response = await fetch(url);
    const json = await response.json();
    return json;
}

/**
 * UNUSED - set the location sharing status in the location list. 
 * This is done only through the Django api
 * @param {*} locationData 
 * @param {*} sharing 
 * @returns 
 */
export async function setLocationShare(locationData, sharing) {
    const url = `${baseURL}location/${locationData["id"]}/?api_key=${APIKEY}`;
    const data = {
        'id': locationData["id"],
        'api_key': APIKEY,
        'name': locationData["name"], 
        'sharing': sharing,
        'longitude': locationData["longitude"],
        'latitude' : locationData["latitude"],
        'datetime': locationData["datetime"]
    }
     const response = await fetch(url, {
        method: "PUT",
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const json = await response.json();
    return json;
}

/**
 * Create a new entry in the sampletolocation api list
 * Specifies that this sample/location pair is being shared
 * @param {*} locationID - the location id of the specified location (from the location list)
 * @param {*} sampleID - the sample id of the specified sample (from the sample list)
 * @returns 
 */
export async function sampleToLocation(locationID, sampleID) {
    const url = `${baseURL}sampletolocation/?api_key=${APIKEY}`;
    const data = {
        'api_key': APIKEY,
        'sample_id': sampleID,
        'location_id': locationID
    }
    const response = await fetch(url, {
        method: "POST",
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const json = await response.json();
    return json;
}

/**
 * Return data of all saved sample/location shares
 * @returns 
 */
export async function getSampleToLocation() {
    const url = `${baseURL}sampletolocation/?api_key=${APIKEY}`;
    const response = await fetch(url);
    const json = await response.json();
    //console.log(json);
    return json;
}

/**
 * Find the sampletolocation id of a sample/location pair. 
 * Required in order to delete the pair from the list when a sample is set to Not Shared.
 * @param {*} sample_id 
 * @param {*} location_id 
 * @returns 
 */
export async function getSampleToLocationId(sample_id, location_id) {
    const url = `${baseURL}sampletolocation/?api_key=${APIKEY}`;
    const response = await fetch(url);
    const json = await response.json();
    const out = json.filter(i => i.sample_id === sample_id && i.location_id === location_id);
    if (out.length !== 0) {
        return out.map(x => x.id)[0]
    } else { 
        return 0;
    }
}

/**
 * Delete a sample/location pair from the sampletolocation list
 * @param {*} sample_id 
 * @param {*} location_id 
 */
export async function deleteSampleToLocation(sample_id, location_id) {
    const s2LId = await getSampleToLocationId(sample_id, location_id);
    const url = `${baseURL}/sampletolocation/${s2LId}/?api_key=${APIKEY}`;
    await fetch(url, {method: "DELETE"});
}