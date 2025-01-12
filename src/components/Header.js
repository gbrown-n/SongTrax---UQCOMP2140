
/**
 * Default web header component - taken from contact class
 */
import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
    const navLinks = [
        {
            name: "List Samples",
            url: "/list",
        },
        {
            name: "Create Samples",
            url: "/create",
        },
        {
            name: "Share Samples",
            url: "/share",
        },
    ];

    return (
        <header className="page-header">
            <Link to="/">
                <h1>SongTrax</h1>
            </Link>
            <nav className="main-menu">
                <p>Create & Share Location Based Music Samples!</p>
            </nav>
        </header>
    );
}