const request = require('request-promise');
const fs = require('fs');
const path = require('path');

const moment = require('moment-timezone');
const cron = require('node-cron');

const timeZone = 'Atlantic/Azores';
const XLSX = require('xlsx');

const immedDCsvCasesUrl = 'https://raw.githubusercontent.com/iMEdD-Lab/open-data/master/COVID-19/greece_cases.csv';
const immedDCsvDeathsUrl = 'https://raw.githubusercontent.com/iMEdD-Lab/open-data/master/COVID-19/greece_deaths.csv';
const lastXColumns = 10;

async function createCsv(
  immedDCsvCasesUrl,
  immedDCsvDeathsUrl,
  lastXColumns
) {
  var csv_cases_filename = path.join(
    __dirname + '/tempDocFolder',
    randomString(15) + '_cases.csv'
  );
  var csv_deaths_filename = path.join(
    __dirname + '/tempDocFolder',
    randomString(15) + '_deaths.csv'
  );

  /*save csv files temporarily to a directory*/
  try {
    await downloadFile(immedDCsvCasesUrl, csv_cases_filename);
    await downloadFile(immedDCsvDeathsUrl, csv_deaths_filename);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: 'Error downloading the file' });
  }

  /*open files as a workbook*/
  try {
    var csv_cases = XLSX.readFile(csv_cases_filename, { codepage: 65001 });
    var csv_deaths = XLSX.readFile(csv_deaths_filename, { codepage: 65001 });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: 'Error at reading file' });
  }

  //create a new array where later will be the workbook
  var new_csv = [];
  //create the columns
  new_csv.push([
    'county',
    'county_ten_days_confirmed',
    'lateset_value_confirmed',
    'progress_ten_days_deaths',
    'latest_value_deaths',
  ]);

  var county_normalized = [];

  //For grouping evoias and ritsonas rows under one row the evoias;
  var evoias_row = ['ΕΥΒΟΙΑΣ', 0, 0, 0, 0];

  //Create an index with all the county_normalized values
  //according to cases csv file.
  var csv_cases_range = XLSX.utils.decode_range(
    csv_cases.Sheets['Sheet1']['!ref']
  );
  for (var R = 1; R <= csv_cases_range.e.r; ++R) {
    county_normalized.push(
      csv_cases.Sheets['Sheet1'][XLSX.utils.encode_cell({ c: 2, r: R })].v
    );
  }

  var csv_deaths_range = XLSX.utils.decode_range(
    csv_deaths.Sheets['Sheet1']['!ref']
  );

  //for each row of the county normalized value
  //we create the rest columns
  for (var i = 0; i < county_normalized.length; i++) {
    var cases_latest = 0;
    //search for the county name
    for (var R = 1; R <= csv_cases_range.e.r; ++R) {
      if (
        county_normalized[i] ==
        csv_cases.Sheets['Sheet1'][XLSX.utils.encode_cell({ c: 2, r: R })].v
      ) {
        //if county_name_exists check if there is any value otherwise leave it as it is, zero
        if (
          typeof csv_cases.Sheets['Sheet1'][
            XLSX.utils.encode_cell({ c: csv_cases_range.e.c, r: R })
          ] != 'undefined'
        ) {
          cases_latest = parseInt(
            csv_cases.Sheets['Sheet1'][
              XLSX.utils.encode_cell({ c: csv_cases_range.e.c, r: R })
            ].w
          );
        }

        //calculate the progress of the last x days
        if (
          typeof csv_cases.Sheets['Sheet1'][
            XLSX.utils.encode_cell({
              c: csv_cases_range.e.c - lastXColumns,
              r: R,
            })
          ] != 'undefined'
        ) {
          progress_x_cases =
            cases_latest -
            parseInt(
              csv_cases.Sheets['Sheet1'][
                XLSX.utils.encode_cell({
                  c: csv_cases_range.e.c - lastXColumns,
                  r: R,
                })
              ].w
            );
        } else {
          progress_x_cases = cases_latest - 0;
        }
      }
    }

    var deaths_latest = 0;

    for (var R = 1; R <= csv_deaths_range.e.r; ++R) {
      if (
        county_normalized[i] ==
        csv_deaths.Sheets['Sheet1'][XLSX.utils.encode_cell({ c: 2, r: R })].v
      ) {
        //if county_name_exists check if there is any value
        if (
          typeof csv_deaths.Sheets['Sheet1'][
            XLSX.utils.encode_cell({ c: csv_deaths_range.e.c, r: R })
          ] != 'undefined'
        ) {
          deaths_latest = parseInt(
            csv_deaths.Sheets['Sheet1'][
              XLSX.utils.encode_cell({ c: csv_deaths_range.e.c, r: R })
            ].w
          );
        }

        //calculate the progress of the last x days
        if (
          typeof csv_deaths.Sheets['Sheet1'][
            XLSX.utils.encode_cell({
              c: csv_deaths_range.e.c - lastXColumns,
              r: R,
            })
          ] != 'undefined'
        ) {
          progress_x_deaths =
            deaths_latest -
            parseInt(
              csv_deaths.Sheets['Sheet1'][
                XLSX.utils.encode_cell({
                  c: csv_deaths_range.e.c - lastXColumns,
                  r: R,
                })
              ].w
            );
        } else {
          progress_x_deaths = deaths_latest - 0;
        }
      }
    }

    //Group Ritsona and Evoias on the same row
    if (
      county_normalized[i] == 'ΡΙΤΣΩΝΑ' ||
      county_normalized[i] == 'ΕΥΒΟΙΑΣ'
    ) {
      evoias_row[1] += progress_x_cases;
      evoias_row[2] += cases_latest;
      evoias_row[3] += progress_x_deaths;
      evoias_row[4] += deaths_latest;
    } else {
      new_csv.push([
        county_normalized[i],
        progress_x_cases,
        cases_latest,
        progress_x_deaths,
        deaths_latest,
      ]);
    }
  }

  new_csv.push(evoias_row);

  // printWorksheet(downloaded_csv.Sheets['Sheet1']);

  /* delete downloaded csv files */
  deleteFile(csv_cases_filename);
  deleteFile(csv_deaths_filename);

  //save generated csv file
  saveFile(
    XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(new_csv)),
    path.join(
      __dirname + '/tempDocFolder',
      'covid19.all.time.' +
        moment().tz(timeZone).format('MMMM Do YYYY, h:mm:ss a') +
        '.csv'
    )
  );
  console.log('CSV file updated.');
}

//update file on startup or server start
deleteAllFilesOfDir(__dirname + '/tempDocFolder');
createCsv(immedDCsvCasesUrl, immedDCsvDeathsUrl, lastXColumns);

//update file every hour
cron.schedule('0 0 */1 * * *', async function () {
  deleteAllFilesOfDir(__dirname + '/tempDocFolder');
  await createCsv(immedDCsvCasesUrl, immedDCsvDeathsUrl, lastXColumns);
});

exports.get = async function (req, res, next) {
  fs.readdir(__dirname + '/tempDocFolder', (err, files) => {
    if (err) throw err;
    return res.download(
      path.join(__dirname + '/tempDocFolder', files[files.length - 1])
    );
  });
};

// function printWorksheet(sheet){

//   var range = XLSX.utils.decode_range(sheet['!ref']);

//   for(var R = range.s.r; R <= range.e.r; ++R) {
//     for(var C = range.s.c; C <= range.e.c; ++C) {
//       console.log(sheet[XLSX.utils.encode_cell({c:C, r:R})]);
//     }
//   }
// }

function deleteFile(dest) {
  fs.unlink(dest, (err) => {
    if (err) throw err;
  });
}

async function downloadFile(url, dest) {
  var dir = path.dirname(dest);
  //check if the directory exists otherwise create it
  if (!fs.existsSync(dir)) {
    console.log('folder does not exist, creating it.');
    fs.mkdirSync(dir);
  }

  //download the file
  var response = await request({
    method: 'GET',
    url: url,
  });

  //Save it
  await new Promise(function (resolve, reject) {
    fs.writeFile(dest, response, function (err) {
      if (err) {
        console.log('Error saving the file');
        return reject(err);
      }

      // console.log('File saved succesfully');
      return resolve('ok');
    });
  });
}

async function saveFile(data, dest) {
  var dir = path.dirname(dest);
  //check if the directory exists otherwise create it
  if (!fs.existsSync(dir)) {
    console.log('folder does not exist, creating it.');
    fs.mkdirSync(dir);
  }

  //Save it
  await new Promise(function (resolve, reject) {
    fs.writeFile(dest, data, function (err) {
      if (err) {
        console.log('Error saving the file');
        return reject(err);
      }

      // console.log('File saved succesfully');
      return resolve('ok');
    });
  });
}

function deleteAllFilesOfDir(directory) {
  //if directory does not exists dont do anything
  if (!fs.existsSync(directory)) {
    console.log('folder does not exist, do not do anything');
    return;
  }

  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      deleteFile(path.join(directory, file));
    }
  });
}

function randomString(length) {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  var randString = '';

  for (var i = 0; i < length; i++) {
    randString += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return randString;
}
