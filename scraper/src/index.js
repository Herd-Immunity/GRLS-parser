import cheerio from 'cheerio';
import got from 'got';
import { load } from 'cjson';
import path from 'path';
import fs from 'fs';

const createRequeredFolders = (filename) => {
  const folders = filename.replace(/\\/g,  path.sep).split(path.sep).slice(0, -1);
  if (folders.length) {
    if (folders.length === 1) {
      if (!fs.existsSync(folders[0])) {
        fs.mkdirSync(folders[0]);
      }
    } else
      // create folder path if it doesn't exist
      folders.reduce((last, folder) => {
        const folderPath = last ? last + path.sep + folder : folder;
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
        }
        return folderPath;
      });
  }
};

const writePdfFile = (filename, pdfBufferData) => {
  createRequeredFolders(filename);

  let writeStream = fs.createWriteStream(filename.replace(/\\/g,  path.sep));
  writeStream.write(pdfBufferData, 'binary');
  writeStream.on('finish', () => {
    console.log(`Saved ${filename}`);
  });
  writeStream.end();
};

const writeJsonFile = (filename, stringContent) => {
  createRequeredFolders(filename);

  fs.writeFileSync(filename, stringContent);
};

const docsSrc = load('src/docs.json');

const getDocBaseData = async (docId) => {
  const response = await got(
    `http://grls.rosminzdrav.ru/Grls_View_v2.aspx?routingGuid=${docId}`
  );

  let $ = cheerio.load(response.body);
  const cookie = response.headers['set-cookie']
    .map((c) => c.replace('; path=/', ''))
    .join(';');

  const registrationId = $('#ctl00_plate_hfIdReg').val();

  const registrationNumber = $('#ctl00_plate_RegNr').val();
  const registrationDate = $('#ctl00_plate_RegDate').val();
  const renewalDate = $('#ctl00_plate_DChange').val();
  const circulationPeriod = $('#ctl00_plate_txtCirculationPeriod').val();

  const manufacturerName = $('#ctl00_plate_MnfClNmR').val();
  const manufacturerCountry = $('#ctl00_plate_CountryClR').val();
  const tradeName = $('#ctl00_plate_TradeNmR').val();
  const internationalName = $('#ctl00_plate_Innr').val();
  const dosageForm = $('#ctl00_plate_drugforms > table > tbody > tr:nth-child(3) > td:nth-child(1)').val();
  const dosage = $('#ctl00_plate_drugforms > table > tbody > tr:nth-child(3) > td:nth-child(2)').val();
  const shelfLife = $('#ctl00_plate_drugforms > table > tbody > tr:nth-child(3) > td:nth-child(3)').val();
  const storageConditions = $('#ctl00_plate_drugforms > table > tbody > tr:nth-child(3) > td:nth-child(4)').val();
  const pharmacotherapeuticGroup = $('#ctl00_plate_grFTG > tbody > tr.hi_sys > td').val();

  return {
    registrationId,
    registrationNumber,
    registrationDate,
    renewalDate,
    circulationPeriod,
    manufacturerName,
    manufacturerCountry,
    tradeName,
    internationalName,
    dosageForm,
    dosage,
    shelfLife,
    storageConditions,
    pharmacotherapeuticGroup,
    cookie
  };
};

const addExtrasToDocs = async (docs) => {
  return Promise.all(
    docs.map(async (doc) => {
      const { cookie, ...docData } = await getDocBaseData(doc.routingGuid);

      const dataResponse = await got.post(
        `https://grls.rosminzdrav.ru/GRLS_View_V2.aspx/AddInstrImg`,
        {
          headers: { cookie, 'Content-Type': 'application/json' },
          body: `{regNumber: '${docData.registrationNumber}', idReg: '${docData.registrationId}'}`,
        }
      );

      const docExtras = JSON.parse(JSON.parse(dataResponse.body).d);

      docExtras.Sources.forEach((src) => {
        src.Instructions.forEach((instruction) => {
          instruction.Images.forEach(async (image) => {
            const pdfResponse = await got(
              `https://grls.rosminzdrav.ru${image.Url}`
            );

            writePdfFile(`data${path.sep}pdfs${path.sep}${image.Url.replace('InstrImg', doc.id)}`, pdfResponse.rawBody);
          });
        });
      });

      return {
        id: doc.id,
        routingGuid: doc.routingGuid,
        ...docData,
        data: docExtras,
      };
    })
  );
};
let json = JSON.stringify(await addExtrasToDocs(docsSrc), null, 2);

writeJsonFile(`data${path.sep}docsWithExtras.json`, json);
