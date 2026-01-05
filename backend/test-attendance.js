const fetch = require('node-fetch');

async function test() {
    try {
        const response = await fetch('http://localhost:3000/api/attendance?fromDate=2025-12-23&toDate=2025-12-23', {
            headers: { 'Authorization': 'Bearer ' + (process.argv[2] || '') } // Pass token optionally
        });
        if (response.status !== 200) {
            console.log('Status:', response.status);
            const text = await response.text();
            console.log('Body:', text);
        } else {
            console.log('Success');
        }
    } catch (e) {
        console.error(e);
    }
}

test();
