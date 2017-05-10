import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Link, BrowserRouter as Router } from 'react-router-dom';

var Signup = () => (
  <div>Signup Page</div>
)

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="header_container">
          <div id="header_wrapper">
          <div id="logo">
            <Link to="/"><h1>Tripmates</h1></Link>
          </div>
          <nav>
              <li><a href="/logout">Log out</a></li>
              <li><Link to="/login">Log in</Link></li>
              <li><Link to="/signup">Sign up</Link></li>
          </nav>
        </div>
      </div>

    )
  }
}

export default Header;
