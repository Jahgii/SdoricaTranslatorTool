import { EnvironmentPlugin } from 'webpack';
import { config } from 'dotenv';

config();

module.exports = {
    plugins: [
        new EnvironmentPlugin([
            'ALLOWED_DOMAIN',
            'GOOGLE_CLIENT_ID'
        ])
    ]
}