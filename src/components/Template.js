
/**
 * Default web template component - taken from contact class
 */
import React from "react";
import PropTypes from "prop-types";
import Header from "./Header";

function Template({ title, children }) {
    return (
        <>
            <Header></Header>
            <main>
                <br></br>
                <h2 class="title">{title}</h2>
                {children}
            </main>
        </>
    );
}

Template.propTypes = {
    title: PropTypes.string.isRequired,
};

export default Template;
            