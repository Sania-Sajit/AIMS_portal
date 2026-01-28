import React, { useEffect, useState } from 'react';
import Landing from './Landing'
function AboutPage(){
    return (
        <div>
        <Landing/>
        <div className='mt-[4rem] ml-14 items-center justify-center'>
            <h1>Looking for a help,</h1>
            <h2>Go to our User Guide <span className='font-semibold'> provide Link to user guide here </span></h2>
        </div>
        </div>

    );
};

export default AboutPage;
