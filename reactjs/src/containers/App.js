import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import { ConnectedRouter as Router } from 'connected-react-router';
import { history } from '../redux'
import { ToastContainer } from 'react-toastify';
import { userIsAuthenticated, userIsNotAuthenticated } from '../hoc/authentication';
import { path } from '../utils'
import Home from '../routes/Home';
import Login from './Auth/Login';
import System from '../routes/System';
import { CustomToastCloseButton } from '../components/CustomToast';
import HomePage from './HomePage/HomePage.js';
import CustomScrollbars from "../components/CustomScrollbars";
import DetailDoctor from './Patient/Doctor/DetailDoctor';
import Doctor from '../routes/Doctor';
import VerifyEmail from './Patient/VerifyEmail';
import DetailSpecialty from './Patient/Specialty/DetailSpecialty';
import DetailClinic from './Patient/Clinic/DetailClinic';
import UserLogin from './Auth/UserLogin.js';
import Profile from './Patient/PatientInfor/Profile.js';
import Appointments from './Patient/PatientInfor/Appointments.js';
import Deposit from './Patient/PatientInfor/Deposit.js';
import register from './Auth/register.js';
import ForgotPassword from './Auth/ForgotPassword.js';
import ResetPassword from './Auth/ResetPassword.js';
import changePassword from './Patient/PatientInfor/changePassword.js';

class App extends Component {

    handlePersistorState = () => {
        const { persistor } = this.props;
        let { bootstrapped } = persistor.getState();
        if (bootstrapped) {
            if (this.props.onBeforeLift) {
                Promise.resolve(this.props.onBeforeLift())
                    .then(() => this.setState({ bootstrapped: true }))
                    .catch(() => this.setState({ bootstrapped: true }));
            } else {
                this.setState({ bootstrapped: true });
            }
        }
    };

    componentDidMount() {
        this.handlePersistorState();
    }

    render() {
        return (
            <Fragment>
                <Router history={history}>
                    <div className="main-container">
                        <div className="content-container">
                            <CustomScrollbars style={{ height: '100vh', width: '100%' }}>
                                <Switch>
                                    <Route path={path.HOME} exact component={(Home)} />
                                    <Route path={path.USERLOGIN} component={userIsNotAuthenticated(UserLogin)} />
                                    <Route path={path.LOGIN} component={userIsNotAuthenticated(Login)} />
                                    <Route path={path.SYSTEM} component={userIsAuthenticated(System)} />
                                    <Route path={'/register'} component={register} />
                                    <Route path="/forgot-password" component={ForgotPassword} />
                                    <Route path="/reset-password/:token" component={ResetPassword} />
                                    <Route path={'/doctor/'} component={userIsAuthenticated(Doctor)} />
                                    <Route path="/profile" component={userIsAuthenticated(Profile)} />
                                    <Route path="/changePassword" component={userIsAuthenticated(changePassword)} />
                                    <Route path="/appointments" component={userIsAuthenticated(Appointments)} />
                                    <Route path="/deposit/:appointmentId" component={userIsAuthenticated(Deposit)} />
                                    <Route path={path.HOMEPAGE} component={HomePage} />
                                    <Route path={path.DETAIL_DOCTOR} component={DetailDoctor} />
                                    <Route path={path.DETAIL_SPECIALTY} component={DetailSpecialty} />
                                    <Route path={path.DETAIL_CLINIC} component={DetailClinic} />
                                    <Route path={path.VERIFY_EMAIL_BOOKING} component={VerifyEmail} />

                                </Switch>
                            </CustomScrollbars>
                        </div>

                        {/* <ToastContainer
                            className="toast-container" toastClassName="toast-item" bodyClassName="toast-item-body"
                            autoClose={false} hideProgressBar={true} pauseOnHover={false}
                            pauseOnFocusLoss={true} closeOnClick={false} draggable={false}
                            closeButton={<CustomToastCloseButton />}
                        /> */}

                        <ToastContainer
                            position="bottom-right"
                            autoClose={5000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                        />
                    </div>
                </Router>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        started: state.app.started,
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);