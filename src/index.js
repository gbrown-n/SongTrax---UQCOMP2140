import React from 'react';

import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';

import App from './pages/App';
import Create from './pages/Create';
import Edit from './pages/Edit';
import ListTemplate from './pages/List';
import Share from './pages/Share';

import { toneObject, toneTransport, tonePart } from "./data/instruments.js";

import reportWebVitals from './reportWebVitals';

import { getSamples } from './components/Requests';

const all_samples = await getSamples();
ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                {all_samples.map(item => <Route path= {`/${item.id}`} element={<Edit id = {item.id} toneObject={toneObject} toneTransport={toneTransport} tonePart={tonePart}/>}/>)}
                <Route path= {"/"} element={<ListTemplate toneObject={toneObject} toneTransport={toneTransport} tonePart={tonePart}/>}/>
                <Route path="/create" element={<Create toneObject={toneObject} toneTransport={toneTransport} tonePart={tonePart}/>}/>
                {all_samples.map(item => <Route path= {`/share/${item.id}`} element={<Share id = {item.id} toneObject={toneObject} toneTransport={toneTransport} tonePart={tonePart}/>}/>)}

            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
