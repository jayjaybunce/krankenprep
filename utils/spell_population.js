"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var csvtojson = require("csvtojson");
var format = require("pg-format");
var BUILD_VERSION = "12.0.1.65893";
var TABLE_FORMAT = "csv";
var URL_BASE = "https://wago.tools/db2";
var COMMUNITY_LISTFILE_URL = "https://github.com/wowdev/wow-listfile/releases/latest/download/community-listfile.csv";
var getUrl = function (table) {
    if (table === 'Spell') {
        return new URL(URL_BASE + "/".concat(table, "/") + TABLE_FORMAT + "?build=".concat(BUILD_VERSION));
    }
    return new URL(URL_BASE + "/".concat(table, "/") + TABLE_FORMAT);
};
var excludedExtentions = [
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
];
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var client, spRes, spCsvText, spellNameData, spellNameStructured, spellNameInsertQuery, queryRes, communityListFileRes, comListfileText, comListFileData, pruned, fileDataQuery, fileDataRes, smRes, smCsvText, smData, spellMiscMapped, smUpdateQuery, smUpdateRes;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new pg_1.Client({
                        host: "ep-muddy-mountain-ahsvq0cr-pooler.c-3.us-east-1.aws.neon.tech",
                        port: 5432,
                        database: "krankenprep-prod",
                        user: "neondb_owner",
                        password: "npg_DqXMu0pN7Rwn",
                        ssl: {
                            rejectUnauthorized: false
                        }
                    });
                    return [4 /*yield*/, client.connect()
                        // Download SpellName File
                    ];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fetch(getUrl("SpellName"))];
                case 2:
                    spRes = _a.sent();
                    return [4 /*yield*/, spRes.text()];
                case 3:
                    spCsvText = _a.sent();
                    return [4 /*yield*/, csvtojson().fromString(spCsvText)];
                case 4:
                    spellNameData = _a.sent();
                    spellNameStructured = spellNameData.map(function (spell) { return [spell.ID, spell.Name_lang]; });
                    spellNameInsertQuery = format("INSERT INTO spells (spell_id, spell_name) VALUES %L ON CONFLICT(spell_id) DO NOTHING;", spellNameStructured);
                    return [4 /*yield*/, client.query(spellNameInsertQuery)];
                case 5:
                    queryRes = _a.sent();
                    console.log("Inserted ".concat(queryRes.rowCount, " rows into spells"));
                    return [4 /*yield*/, fetch(COMMUNITY_LISTFILE_URL)];
                case 6:
                    communityListFileRes = _a.sent();
                    return [4 /*yield*/, communityListFileRes.text()];
                case 7:
                    comListfileText = _a.sent();
                    return [4 /*yield*/, csvtojson({ headers: ['id', "filename"], delimiter: ';' }).fromString(comListfileText)];
                case 8:
                    comListFileData = _a.sent();
                    pruned = [];
                    comListFileData.forEach(function (x) {
                        var filenameSplit = x.filename.split("/");
                        var filename = filenameSplit[filenameSplit.length - 1];
                        var extensionSplit = filename.split(".");
                        var extension = extensionSplit[extensionSplit.length - 1];
                        if (extension === 'blp') {
                            pruned.push([x.id, extensionSplit[0]]);
                        }
                    });
                    fileDataQuery = format("INSERT INTO file_data (file_data_id, filename) VALUES %L ON CONFLICT(file_data_id) DO NOTHING;", pruned);
                    return [4 /*yield*/, client.query(fileDataQuery)];
                case 9:
                    fileDataRes = _a.sent();
                    console.log("Inserted ".concat(fileDataRes.rowCount, " rows into file_data"));
                    return [4 /*yield*/, fetch(getUrl("SpellMisc"))];
                case 10:
                    smRes = _a.sent();
                    return [4 /*yield*/, smRes.text()];
                case 11:
                    smCsvText = _a.sent();
                    return [4 /*yield*/, csvtojson().fromString(smCsvText)];
                case 12:
                    smData = _a.sent();
                    spellMiscMapped = smData
                        .filter(function (row) { return row.SpellIconFileDataID !== '0'; })
                        .map(function (row) { return [row.SpellID, row.SpellIconFileDataID]; });
                    smUpdateQuery = format("UPDATE spells SET file_data_id = v.file_data_id::int\n         FROM (VALUES %L) AS v(spell_id, file_data_id)\n         WHERE spells.spell_id = v.spell_id::int", spellMiscMapped);
                    return [4 /*yield*/, client.query(smUpdateQuery)];
                case 13:
                    smUpdateRes = _a.sent();
                    console.log("Updated ".concat(smUpdateRes.rowCount, " spells with file_data_id"));
                    client.end();
                    return [2 /*return*/];
            }
        });
    });
}
main();
