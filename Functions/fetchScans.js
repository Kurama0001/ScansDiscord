const {
  readdirSync,
  writeFile
} = require('fs');

const get = require('axios').get;
const url = "https://s22.anime-sama.me/s1/scans/";

module.exports = async () => {
  try {
    const listsScanValid = readdirSync('./Scans');

    if(listsScanValid.length === 0) {
      const response = await get(url);
      if(!response || !response.data) return [];

      let dataContent = response.data;
      if(dataContent) {
        dataContent = dataContent.match(/\/s1\/scans\/[^\/]+\/[^\/]*\/?/g);
        dataContent = dataContent
          .filter(string => string?.includes('/"><img'))
          .map(string => string?.split('/"><img')?.[0]?.split("scans/")?.[1]);
      };

      dataContent = dataContent.map(scan_name => scan_name = decodeURIComponent(scan_name));
      dataContent.forEach(scan_name => writeFile(`./Scans/${scan_name}.json`, JSON.stringify({}, null, 4), () => {}));

      return dataContent;
    } else return listsScanValid.map(scan_name => scan_name.split('.json')[0]);
  } catch (error) {
    console.log(error);
  };
};