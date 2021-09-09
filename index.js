const fs = require('fs');
const path = require('path');
const {parse} = require('fast-csv');
const moment = require('moment');
const JSZip = require('jszip');

const readZip = (error, data) => {
    if(error) throw error;
    JSZip.loadAsync(data).then(parseData).catch("error")
}

const parseData = (zip) => {
    const {files} = zip;
    const result = [];

    const transformUser = (user) => {
        const userData = {
            name: user.name,
            phone: user.phone.replace(/[^\d]/g, ''),
            person: {
                firstName: user.first_name,
                lastName: user.last_name
            },
            amount: Math.floor(+user.amount),
            date: moment(user.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            costCenterNum: user.cc.slice(3)
        }
        result.push(userData)
    }

    Object.keys(files).forEach(filename => {
        const dataTranformation = (data) => {
        const stream = parse({headers: true, delimiter: "|"}).on('error', error => console.error(error)).on('data', transformUser);
            stream.write(data);
            stream.end(() =>{
                const file = JSON.stringify(result)
                fs.writeFileSync(`result.json`,file)
                console.log(`Created Json file : result.json`)
            })
        };
        zip.file(filename).async("string").then(dataTranformation)
    })
}
fs.readFile(path.join('Carrier_Integration_-_Data.zip'), readZip)