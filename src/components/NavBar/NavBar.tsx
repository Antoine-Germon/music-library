import React from 'react';
import { Link } from 'react-router-dom';

import './NavBar.css';

function NavBar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="downloadSong">Download Song</Link>
        </li>
        <li>
          <Link to="listen">Listen</Link>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;