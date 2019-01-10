let csv = require("fast-csv");

let readCSV = () => {

    let file_name = 'sanam.csv';
    let list = [];

    return new Promise((resolve, reject) => {
        csv
            .fromPath(file_name)
            .on("data", (data) => {
                list.push(data)
            })
            .on("end", (data) => {
                resolve(list);
            });
    });

};

let readSanamCSV = () => {

    return readCSV().then((result) => {

        let list = []
        for (let i = 1; i < result.length; i++)
            for (let j = 1; j < result[i].length; j++)
                list.push(result[i][j]);
    
        return list;
    
    });

};

module.exports.readSanamCSV = readSanamCSV;
