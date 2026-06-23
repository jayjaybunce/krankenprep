import type { FC } from "react";

const NSRTNoteString = `EncounterID:3183;Difficulty:Mythic;Name:Lura

time:3;ph:1;tag:Tettybear;spellid:391528;
time:4;ph:1;tag:Wynsloww;spellid:472433;
time:5;ph:1;tag:Tettybear;spellid:22812;
time:6;ph:1;bossSpell:1284931;tag:Funkdrip;spellid:114052;
time:7;ph:1;tag:Tettybear;spellid:740;
time:15;ph:1;tag:Tettybear;spellid:29166;text:Innervate Magic;glowunit:magicpally;
time:51;ph:1;tag:Funkdrip;spellid:192077;
time:57;ph:1;bossSpell:1279420;tag:Krankenmight;spellid:374968;
time:57;ph:1;bossSpell:1279420;tag:everyone;text:Cross then move;
time:61;ph:1;tag:Arx;spellid:51052;
time:63;ph:1;tag:Magicpally;spellid:31884;
time:68;ph:1;bossSpell:1284931;tag:Tettybear;spellid:22812;
time:68;ph:1;bossSpell:1284931;tag:Krankenmight;spellid:374227;
time:68;ph:1;bossSpell:1284931;tag:everyone;text:Personals;
time:69;ph:1;tag:Tettybear;spellid:391528;
time:72;ph:1;tag:Magicpally;spellid:31821;
time:73;ph:1;tag:Wynsloww;spellid:421453;
time:81;ph:1;tag:Funkdrip;spellid:98008;
time:119;ph:1;bossSpell:1279420;tag:Tettybear;spellid:106898;
time:119;ph:1;bossSpell:1279420;tag:everyone;text:Cross then move;
time:125;ph:1;tag:Wynsloww;spellid:472433;
time:126;ph:1;tag:Funkdrip;spellid:114052;
time:129;ph:1;tag:Tettybear;spellid:391528;
time:130;ph:1;bossSpell:1284931;tag:Tettybear;spellid:22812;
time:130;ph:1;bossSpell:1284931;tag:Gruesum;spellid:51052;
time:130;ph:1;bossSpell:1284931;tag:Jaemsy;spellid:97462;
time:150;ph:1;tag:Funkdrip;spellid:192077;
time:180;ph:1;tag:Tettybear;spellid:106898;
time:180;ph:1;tag:Krankenmight;spellid:374968;
time:10;ph:2;tag:Magicpally;spellid:31884;
time:10;ph:2;tag:Tettybear;spellid:391528;
time:14;ph:2;tag:Tettybear;spellid:740;
time:16;ph:2;tag:Tettybear;spellid:102342;text:Bark Jake;glowunit:tatros;
time:35;ph:2;tag:Wynsloww;spellid:33206;text:PS Jake;
time:16;ph:3;tag:Wynsloww;spellid:472433;
time:17;ph:3;tag:Arx;spellid:51052;
time:21;ph:3;tag:Funkdrip;spellid:114052;
time:22;ph:3;tag:Tettybear;spellid:106898;
time:25;ph:3;tag:Tettybear;spellid:391528;
time:46;ph:3;tag:Magicpally;spellid:31821;
time:48;ph:3;bossSpell:1284525;tag:Metzinger;spellid:196718;
time:48;ph:3;bossSpell:1284525;tag:everyone;text:Personals;
time:51;ph:3;tag:Funkdrip;spellid:192077;
time:77;ph:3;tag:Funkdrip;spellid:98008;
time:82;ph:3;tag:Deeznutticus;spellid:12323;
time:87;ph:3;tag:Tettybear;spellid:391528;
time:88;ph:3;tag:Magicpally;spellid:31884;
time:88;ph:3;tag:Wynsloww;spellid:421453;
time:101;ph:3;tag:Tettybear;spellid:106898;
time:104;ph:3;bossSpell:1281184;tag:Jaemsy;spellid:97462;
time:3;ph:4;tag:Wynsloww;spellid:472433;
time:49;ph:4;tag:Tettybear;spellid:391528;
time:52;ph:4;bossSpell:1266388;tag:Tettybear;spellid:740;
time:55;ph:4;tag:Funkdrip;spellid:114052;
time:62;ph:4;tag:Funkdrip;spellid:192077;
time:94;ph:4;tag:Wynsloww;spellid:472433;
time:110;ph:4;tag:Tettybear;spellid:391528;
time:112;ph:4;tag:Magicpally;spellid:31884;
time:119;ph:4;bossSpell:1251343;tag:Tettybear;spellid:106898;
time:135;ph:4;tag:Magicpally;spellid:31821;
time:161;ph:4;tag:Funkdrip;spellid:98008;
time:170;ph:4;tag:Tettybear;spellid:391528;
time:182;ph:4;tag:Funkdrip;spellid:114052;
time:188;ph:4;tag:Funkdrip;spellid:192077;
time:191;ph:4;tag:Wynsloww;spellid:472433;
time:28;ph:1;tag:Metzinger Zaghunt Tatros;text:Pick up Crystal;colors:1 1 0.2 1;
time:92;ph:1;tag:Skellestone Krankenmight Wipe;text:Pick up Crystal;colors:1 1 0.2 1;
time:16;ph:1;tag:Arx Gruesum;text:Grip Adds;colors:1 0.16 0.16 1;
time:78;ph:1;tag:Arx Gruesum;text:Grip Adds;colors:1 0.16 0.16 1;
time:140;ph:1;tag:Arx Gruesum;text:Grip Adds;colors:1 0.16 0.16 1;
time:16;ph:1;tag:Wynsloww Krankenmight;text:Grip Crystal;colors:1 1 1 1;
time:78;ph:1;tag:Wynsloww Krankenmight;text:Grip Crystal;colors:1 1 1 1;
time:13;ph:3;tag:Wynsloww Magicpally Funkdrip Tettybear Zaghunt;text:Soak {cross};colors:1 0.16 0.16 1;
time:43;ph:3;tag:Wynsloww Magicpally Funkdrip Tettybear Zaghunt;text:Soak {cross};colors:1 0.16 0.16 1;
time:73;ph:3;tag:Wynsloww Magicpally Funkdrip Tettybear Zaghunt;text:Soak {cross};colors:1 0.16 0.16 1;
time:13;ph:3;tag:Gruesum Jaemsy Krankenmight Tatros Metzinger;text:Soak {star};colors:1 1 0.2 1;
time:43;ph:3;tag:Gruesum Jaemsy Krankenmight Tatros Metzinger;text:Soak {star};colors:1 1 0.2 1;
time:73;ph:3;tag:Gruesum Jaemsy Krankenmight Tatros Metzinger;text:Soak {star};colors:1 1 0.2 1;
time:13;ph:3;tag:Goomt Deeznutticus Uchai Arx Skellestone;text:Soak {circle};colors:1 0.5 0 1;
time:43;ph:3;tag:Goomt Deeznutticus Uchai Arx Skellestone;text:Soak {circle};colors:1 0.5 0 1;
time:73;ph:3;tag:Goomt Deeznutticus Uchai Arx Skellestone;text:Soak {circle};colors:1 0.5 0 1;
time:13;ph:3;tag:Sobiezhunter Stridur Wipe Lyconic Pkrz;text:Soak {skull};colors:1 1 1 1;
time:43;ph:3;tag:Sobiezhunter Stridur Wipe Lyconic Pkrz;text:Soak {skull};colors:1 1 1 1;
time:73;ph:3;tag:Sobiezhunter Stridur Wipe Lyconic Pkrz;text:Soak {skull};colors:1 1 1 1;
time:61;ph:4;tag:Zaghunt Metzinger;text:Pop Crystal;colors:1 0.16 0.16 1;
time:116;ph:4;tag:Tatros Skellestone;text:Pop Crystal;colors:1 0.16 0.16 1;
time:171;ph:4;tag:Wynsloww Tettybear;text:Pop Crystal;colors:1 0.16 0.16 1;

Crystals
Crystal spawn 1 (0:28): Metzinger Zaghunt Tatros
Crystal spawn 2 (1:32): Skellestone Krankenmight Wipe

P1 Grip Adds
Grip Adds: Arx Gruesum
Grip Crystals: Wynsloww Krankenmight

intstart
Pkrz Zaghunt Stridur Tatros
Metzinger Sobiezhunter Deeznutticus Goomt
Krankenmight Wipe Arx Uchai
intend

Intermission Spreads
Tanks: Jaemsy Gruesum
Healers: Tettybear Magicpally Wynsloww Funkdrip
DPS: Arx Krankenmight Goomt Uchai Tatros Metzinger Lyconic Stridur Sobiezhunter Pkrz Skellestone Zaghunt Wipe Deeznutticus

P2 Galvanize Soaks
Healers: Wynsloww Magicpally Funkdrip Tettybear Zaghunt
Tanks: Gruesum Jaemsy Krankenmight Tatros Metzinger
Melee: Goomt Deeznutticus Uchai Arx Skellestone
Ranged: Sobiezhunter Stridur Wipe Lyconic Pkrz

P2 Spread Positions
North West: Metzinger Wynsloww Magicpally Tettybear
North East: Tatros Zaghunt Funkdrip Sobiezhunter
West: Krankenmight Goomt Jaemsy
East: Wipe Pkrz Lyconic
South West: Skellestone Uchai Deeznutticus
South East: Stridur Arx Gruesum

P3 Pop Crystal
Pop Crystal 1 (6:31): Zaghunt Metzinger
Pop Crystal 2 (7:26): Tatros Skellestone
Pop Crystal 3 (8:21): Wynsloww Tettybear

P3 Sides
Left: Jaemsy Goomt Deeznutticus Krankenmight Zaghunt Sobiezhunter Pkrz Skellestone Funkdrip Wynsloww
Right: Gruesum Tatros Arx Uchai Metzinger Stridur Wipe Lyconic Tettybear Magicpally

invitelist:Tettybear-Area52 Funkdrip-Area52 Uchai-Area52 Tatros-BleedingHollow Goomt-Area52 Pkrz-Sargeras Metzinger-Area52 Sobiezhunter-Area52 Stridur-Area52 Zaghunt-Sargeras Wynsloww-WyrmrestAccord Skellestone-Area52 Wipe-Sargeras Arx-Stormrage Lyconic-Mal'Ganis Magicpally-Area52 Jaemsy-Stormrage Gruesum-Tichondrius Krankenmight-Area52 Deeznutticus-Anvilmar;   `


const cleanAndSeparate = (input: string) => {
    const x = input.split("\n")
    const filtered = x.filter((line) => !line.includes("time:") && !line.includes("EncounterID"))
    const structured: { heading: string, indexed_players: string[], subheadings: { heading: string, players: string[] }[] }[] = []
    let heading = false
    filtered.forEach((line) => {
        if (line === "" && heading === true){
            heading = false
        }
        if (structured.length > 0 && structured[structured.length - 1].heading.includes("start") && line.includes("end") && heading === true){
            heading = false
            return
        }
        if (heading){
            const lastColon = line.lastIndexOf(":")
            const names = line.substring(lastColon + 1)
            const nameArray = names.split(" ").map(name => name.trim()).filter((x) => x !== "")
            structured[structured.length - 1].subheadings.push({ heading: line.substring(0, lastColon), players: nameArray })
            structured[structured.length - 1].indexed_players = structured[structured.length - 1].indexed_players.concat(nameArray)
            return
        }
        if (line !== ""){
            heading = true
            structured.push({ heading: line, indexed_players: [], subheadings: [] })
        }
    })
    return structured
}


export const Assignments: FC = () => {
    const cleaned = cleanAndSeparate(NSRTNoteString)
    console.log(cleaned)



    return <></>


}