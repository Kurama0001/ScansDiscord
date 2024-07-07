const { 
  transformLink, 
  getLastNumber 
} = require('./Functions');

const {
  writeFile
} = require('fs');

const get = require('axios').get;
const url = "https://s22.anime-sama.me/s1/scans/";

module.exports = async (scan_name, scan_id) => {
  try {
    const fileScanChapter = `./Scans/${scan_name}.json`;
    let scan_data_json = require("." + fileScanChapter);

    if(scan_data_json[scan_id]) return transformLink(scan_data_json[scan_id]);

    const response = await get(`${url}${encodeURIComponent(scan_name)}/${scan_id}`);
    if(!response || !response.data) return [];

    let dataContent = response.data;

    let images = dataContent.match(/\/s1\/scans\/.*?\.(png|jpe?g|gif|bmp|webp|tiff?)/g);
    if(!images.length) return [];

    images.sort((a, b) => getLastNumber(a) - getLastNumber(b));

    scan_data_json[scan_id] = images;
    writeFile(fileScanChapter, JSON.stringify(scan_data_json, null, 4), () => {});

    return transformLink(images);
  } catch (error) {
    console.log(error);
  };
};