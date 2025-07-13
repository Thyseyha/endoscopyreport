

import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useLocale } from '../hooks/useLocale';
import { Card, Input, Button } from './ui';

const Login: React.FC = () => {
    const { login } = useData();
    const { t } = useLocale();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd validate credentials
        if (username && password) {
            login();
        } else {
            alert(t('login_error_credentials'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-indigo-600">{t('app_title')}</h1>
                <p className="text-gray-600 mt-2">{t('login_subtitle')}</p>
            </div>
            <Card className="w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{t('staff_login')}</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <Input 
                        id="username"
                        label={t('username')}
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={t('username_placeholder')}
                        required
                    />
                    <Input 
                        id="password"
                        label={t('password')}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        required
                    />
                    <Button type="submit" className="w-full">
                        {t('login_button')}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default Login;
