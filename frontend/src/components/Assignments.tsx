export type ParsedSubheading = { heading: string; players: string[], heading_alias?: string }
export type ParsedSection = { heading: string; indexed_players: string[]; subheadings: ParsedSubheading[] }

export const cleanAndSeparate = (input: string): ParsedSection[] => {
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