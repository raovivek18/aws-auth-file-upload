import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const Login = ({ components }) => {
    return (
        <div className="auth-container">
            <div className="glass-card" style={{ width: '100%', maxWidth: '450px', background: 'var(--card-bg)' }}>
                <Authenticator components={components} />
            </div>
        </div>
    );
};

export default Login;
