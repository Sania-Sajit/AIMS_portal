import React, { useEffect, useState } from 'react';
import Landing from './Landing'

function HomePage(){
    return (
        <div>
          <Landing/>
          <div className='mt-[4rem] ml-[6rem]'>
          <h1 className='text-3xl font-semibold'>Academic Information Management System.</h1>
          {/*<h3 className='text-red-500 font-semibold'>Please DO NOT edit or manipulate the URLs or requests when using this application. Doing so may lock your account.</h3>
          <h6>Please proceed by choosing a menu item from the top bar.</h6>
          <h6 className='font-semibold'>Before contacting @aims_help for any issues, please check the User Guide for solution.</h6>
          <h6>Note:</h6>
          <ul>
            <li>Please directly contact the course instructor for any changes to your enrolment requests.</li>
            <li>We have not yet fully imported your past enrolments data into this system. You may not get to see grades for some of your past courses.</li>
          </ul>
          */}
        </div>
        </div>
    );
};

export default HomePage;
