import React from 'react';
import { Route, IndexRoute } from 'react-router';
import App from '.App';

export default (
    <Router history={browserHistory} basename={'colress'}>
        <Route path="/" component={App} />
    </Router>
);