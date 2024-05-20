// This line loads .env file variables from ./.env
require('dotenv').config();

const ldap = require('ldapjs');

// Create LDAP client
const client = ldap.createClient({
    url: 'ldap://192.168.2.94:389'
})

// LDAP bind credentials
const adminDn = 'administrator';
//const adminPassword = process.env.PASSWORD;
const adminPassword = 'EMSD@ssw0rd';

// Base DN from where the search begins
const searchBase = 'OU=Users,OU=nextcloud,DC=devAD,DC=local'

const searchOptions = {
    // Object class for AD users
    filter: '(objectclass=user)',
    scope: 'sub',
    attributes: ['cn', 'mail'] // Common Name & Email Address
};

// Binding to LDAP with admin credentials
client.bind(adminDn, adminPassword, (err) => {

    if (err) {
        console.log(`Bind Error: ${err}`);
        return;
    }

    // Performing the search
    client.search(searchBase, searchOptions, (err, res) => {
        if (err) {
            console.log(`Search Error: ${err}`);
            return;
        }

        res.on('searchEntry', (entry) => {
            console.log('entry: ' + JSON.stringify(entry.object));
        });

        res.on('searchReference', (referral) => {
            console.log(`referral: ` + referral.uris.json());
        });

        res.on('error', (err) => {
            console.log(`Error: ` + err.message);
        });

        res.on('end', (result) => {
            console.log(`Search status: ` + result.status);
            client.unbind((err) => {
                if (err) {
                    console.log(`Unbind Error: `, err);
                } else {
                    console.log(`Disconnected from LDAP`);
                }
            });
        });
    });
});