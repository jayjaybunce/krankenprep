
export type SectionContent = {
    id: number
    type: string
    value: string
    caption: string

}

export type Section = {
    id: number
    variant: string
    contents: SectionContent[]
}

export type Phase = {
    id: number
    name: string
    boss_id: number
    variant: string
    sections: Section[]
}