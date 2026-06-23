import { Client } from "pg"
// import * as csvtojson from 'csvtojson'

import csvtojson from 'csvtojson'
// import * as format from 'pg-format'
import format from 'pg-format'


const BUILD_VERSION = "12.1.0.68209"
const TABLE_FORMAT = "csv"
const URL_BASE = "https://wago.tools/db2"
const COMMUNITY_LISTFILE_URL = "https://github.com/wowdev/wow-listfile/releases/latest/download/community-listfile.csv"

type Table = 'Spell' | 'SpellMisc' | 'SpellName' | 'SpellIconFileDataID'

const getUrl = (table: Table) => {
    if (table === 'Spell'){
        return new URL(URL_BASE + `/${table}/` + TABLE_FORMAT + `?build=${BUILD_VERSION}`)
    }
    return new URL(URL_BASE + `/${table}/` + TABLE_FORMAT)
    
}

type SpellData = {
    ID: string,
    Name_lang: string
}

const excludedExtentions = [
    "ogg",
    "mp3",
    "wmo",
    "avi",
    "skin",
    "anim",
    "dat",
    "h2o",
    "what",
    "wlw",
    "delete",
    "m2",
    "adt",
    "pm4"
]

async function main (){
    const client = new Client({
        host: "ep-muddy-mountain-ahsvq0cr-pooler.c-3.us-east-1.aws.neon.tech",
        port: 5432,
        database: "krankenprep-prod",
        user: "neondb_owner",
        password: "npg_oEWZjw7bL2eR",
        ssl: {
            rejectUnauthorized: false
        }
    })
    await client.connect()
    // Download SpellName File
    const spRes = await fetch(getUrl("SpellName"))
    const spCsvText = await spRes.text()
    const spellNameData = await csvtojson().fromString(spCsvText)
    const spellNameStructured = spellNameData.map((spell) => [spell.ID, spell.Name_lang])

    const spellNameInsertQuery = format("INSERT INTO spells (spell_id, spell_name) VALUES %L ON CONFLICT(spell_id) DO NOTHING;", spellNameStructured)
    const queryRes = await client.query(spellNameInsertQuery)
    console.log(`Inserted ${queryRes.rowCount} rows into spells`)


    const communityListFileRes = await fetch(COMMUNITY_LISTFILE_URL)
    const comListfileText = await communityListFileRes.text()
    const comListFileData = await csvtojson({ headers: ['id', "filename"], delimiter: ';'}).fromString(comListfileText)
    const pruned: Array<[string, string]> = []
    comListFileData.forEach((x: {id: string, filename: string }) => {
        const filenameSplit = x.filename.split("/")
        const filename = filenameSplit[filenameSplit.length - 1]
        const extensionSplit = filename.split(".")
        const extension = extensionSplit[extensionSplit.length - 1]
        if (extension === 'blp'){
            pruned.push([x.id, extensionSplit[0]])
        }
        
    })
    const fileDataQuery = format("INSERT INTO file_data (file_data_id, filename) VALUES %L ON CONFLICT(file_data_id) DO NOTHING;", pruned)
    const fileDataRes = await client.query(fileDataQuery)
    console.log(`Inserted ${fileDataRes.rowCount} rows into file_data`)
    // To-Do Spell misc contains SpellID and SpellIconFileDataID which maps directly to file_data tables file_data_id. 
    // I need to downlaod the file for SpellMisc and use this data to complete the spell row, completing the FK relationship 

    const smRes = await fetch(getUrl("SpellMisc"))
    const smCsvText = await smRes.text()
    const smData = await csvtojson().fromString(smCsvText)
    const spellMiscMapped = smData
        .filter((row) => row.SpellIconFileDataID !== '0')
        .map((row) => [row.SpellID, row.SpellIconFileDataID])

    const smUpdateQuery = format(
        `UPDATE spells SET file_data_id = v.file_data_id::int
         FROM (VALUES %L) AS v(spell_id, file_data_id)
         WHERE spells.spell_id = v.spell_id::int`,
        spellMiscMapped
    )
    const smUpdateRes = await client.query(smUpdateQuery)
    console.log(`Updated ${smUpdateRes.rowCount} spells with file_data_id`)
    client.end()

}


main()