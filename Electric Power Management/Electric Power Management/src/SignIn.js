import React from 'react';
import { withRouter } from 'react-router-dom';
import { State } from 'react-powerplug';
import { auth } from './firebase';
import * as routes from './constants/routes';
import {  MDBBtn } from 'mdbreact';
class SignIn extends React.Component {
  handleSubmit = ({ email, password }) => {
    return auth
      .doSignInWithEmailAndPassword(email, password)
      .then(response => {
        console.log('Successful Sign In', response);
        this.props.history.push(routes.HOME_PATH);
      })
      .catch(err => {
        console.log('Failed Sign In', err);
        throw err;
      });
  };

  render() {
    return (
      <State initial={{ email: '', password: '', error: null }}>
        {({ state, setState }) => {
          const onEmailChange = e => {
            setState({ email: e.target.value });
          };
          const onPasswordChange = e => {
            setState({ password: e.target.value });
          };
          const onSubmit = e => {
            e.preventDefault();
            this.handleSubmit({
              email: state.email,
              password: state.password,
            }).catch(err => {
              setState({ error: err.message });
            });
          };

          return (
            <div className="container-fluid" style={{width: "40%"}}>
              <h1>Sign In</h1>
              <form className="form-group" onSubmit={onSubmit}>
                {state.error &&
                  <p style={{ color: 'red' }}>
                    {state.error}
                  </p>}
                <label htmlFor="email">Email</label>
                <input
                    className="form-control"
                    style={{width: "100%"}}
                    type="text"
                    name="email"
                    value={state.email}
                    onChange={onEmailChange}
                />

                <label htmlFor="password">Password</label>
                <input
                    className="form-control"
                    type="password"
                    name="password"
                    value={state.password}
                    onChange={onPasswordChange}
                />

                <MDBBtn className="btn btn-primary" type="submit" size="sm">Sign In</MDBBtn>
              </form>
              



      



            </div>
           
          );
          
        }}
      </State>
    );
  }
}






export default withRouter(SignIn);
