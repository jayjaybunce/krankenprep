const gatewayIcon = {
    name: "Gateway",
    iconSrc: "/icons/gateway.png",
}

export type RaidData = {
  raidName: string;
  bosses: {
    name: string;
    backgrounds: {
      name: string;
      src: string;
    }[];
    npcIcons: {
      name: string;
      iconSrc: string;
    }[];
    spellIcons: {
      name: string;
      iconSrc: string;
    }[];
  }[];
}[];

export const midnight: RaidData = [
  {
      raidName: "Sporefall",
      bosses: [
        {
          name: "Rotmire",
          backgrounds: [
            {
              name: "Platform",
              src: "/midnight/sporefall/rotmire/platform.png"
              
            }
          ],
          npcIcons: [
            gatewayIcon,
            {
              name: "Rotmire",
              iconSrc: "/midnight/sporefall/rotmire/rotmire.png",
            },
            {
              name: "Sporecap",
              iconSrc: "/midnight/sporefall/rotmire/sporecap.png",
            },
            {
              name: "Shroomling",
              iconSrc: "/midnight/sporefall/rotmire/shroomling.png",
            },
            {
              name: "Fungling",
              iconSrc: "/midnight/sporefall/rotmire/fungling.png",
            },
          ],
          spellIcons: [
            {
              name: "Awaken Fungi",
              iconSrc: "/midnight/sporefall/rotmire/awaken-fungi.png"
            },
            {
              name: "Blightshot",
              iconSrc: "/midnight/sporefall/rotmire/blight-shot.png"
            },
            {
              name: "Bursting Shroom",
              iconSrc: "/midnight/sporefall/rotmire/bursting-shroom.png"
            },
            {
              name: "Bursting Doom Shroom",
              iconSrc: "/midnight/sporefall/rotmire/bursting-doom-shroom.png"
            },
            {
              name: "Cross Fertilization",
              iconSrc: "/midnight/sporefall/rotmire/cross-fertilization.png"
            },
            {
              name: "Festering Vines",
              iconSrc: "/midnight/sporefall/rotmire/festering-vines.png"
            },
            {
              name: "Fungal Bloom",
              iconSrc: "/midnight/sporefall/rotmire/fungal-bloom.png"
            },
            {
              name: "Fungal Frenzy",
              iconSrc: "/midnight/sporefall/rotmire/fungal-frenzy.png"
            },
            {
              name: "Poison Burst",
              iconSrc: "/midnight/sporefall/rotmire/poison-burst.png"
            },
            {
              name: "Purtid Fist",
              iconSrc: "/midnight/sporefall/rotmire/putrid-fist.png"
            },
            {
              name: "Writhing Vines",
              iconSrc: "/midnight/sporefall/rotmire/writhing-vines.png"
            },
          ]
        }
      ]
  },
  {
    raidName: "The Dreamrift",
    bosses: [
      {
        name: "Chimaerus the Undreamt God",
        backgrounds: [
          {
            name: "Platform",
            src: "/midnight/dreamrift/chimaerus/platform.png",
          },
        ],
        npcIcons: [
            gatewayIcon,
            {
                name: "Chimaerus",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/chimaerus.png",
            },
            {
                name: "Colossal Horror",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/colossal-horror.png",
            },
            {
                name: "Haunting Essence",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/haunting-essence.png",
            },
            {
                name: "Swarming Shade",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/swarming-shade.png",
            }

        ],
        spellIcons: [
            {
                name: "Dissonance",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/dissonance.png"
            },
            {
                name: "Alncrazed Rage",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/alncrazed-rage.png"
            },
            {
                name: "Alndust Essence",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/alndust-essence.png"
            },
            {
                name: "Alndust Upheaval",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/alndust-upheaval.png"
            },
            {
                name: "Alnshroud",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/alnshroud.png"
            },
            {
                name: "Cannibalized Essence",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/cannibalized-essence.png"
            },
            {
                name: "Caustic Phlegm",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/caustic-phlegm.png"
            },
            {
                name: "Colossal Strikes",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/colossal-strikes.png"
            },
            {
                name: "Consuming Miasma",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/consuming-miasma.png"
            },
            {
                name: "Corrupted Devastation",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/corrupted-devastation.png"
            },
            {
                name: "Discordant Roar",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/discordant-roar.png"
            },
            {
                name: "Essence Bolt",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/essence-bolt.png"
            },
            {
                name: "Fearsome Cry",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/fearsome-cry.png"
            },
            {
                name: "Insatiable",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/insatiable.png"
            },
            {
                name: "Lingering Miasma",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/lingering-miasma.png"
            },
            {
                name: "Ravenous Dive",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/ravenous-dive.png"
            },
            {
                name: "Rending Tear",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/rending-tear.png"
            },
            {
                name: "Rift Emergence",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/rift-emergence.png"
            },
            {
                name: "Rift Madness",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/rift-madness.png"
            },
            {
                name: "Rift Shroud",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/rift-shroud.png"
            },
            {
                name: "Rift Sickness",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/rift-sickness.png"
            },
            {
                name: "Rift Vulnerability",
                iconSrc: "/midnight/dreamrift/chimaerus/icons/rift-vulnerability.png"
            }
        ]
      },
    ],
  },
  {
    raidName: "The Voidspire",
    bosses: [
      {
        name: "Imperator Averzian",
        backgrounds: [
          {
            name: "Arena",
            src: "/midnight/voidspire/averzian/arena.png",
          },
          {
            name: "Alt",
            src: "/midnight/voidspire/averzian/alt.png",
          },
        ],
        npcIcons: [
            gatewayIcon,
            {
                name: "Imperator Averzian",
                iconSrc: "/midnight/voidspire/averzian/icons/imperator-averzian.png",
            },
            {
                name: "Abyssal Gatekeeper",
                iconSrc: "/midnight/voidspire/averzian/icons/abyssal-gatekeeper.png",
            },
            {
                name: "Obscurion Endwalker",
                iconSrc: "/midnight/voidspire/averzian/icons/obscurion-endwalker.png",
            },
            {
                name: "Shadowguard Stalwart",
                iconSrc: "/midnight/voidspire/averzian/icons/shadowguard-stalwart.png",
            },
            {
                name: "Voidmaw",
                iconSrc: "/midnight/voidspire/averzian/icons/voidmaw.png",
            }
        ],
        spellIcons: [
            {
                name: "Blackening Wounds",
                iconSrc: "/midnight/voidspire/averzian/icons/blackening-wounds.png"
            },
            {
                name: "Cosmic Erruption",
                iconSrc: "/midnight/voidspire/averzian/icons/cosmic-erruption.png"
            },
            {
                name: "Dark Resillience",
                iconSrc: "/midnight/voidspire/averzian/icons/dark-resillience.png"
            },
            {
                name: "Dark Tear",
                iconSrc: "/midnight/voidspire/averzian/icons/dark-tear.png"
            },
            {
                name: "Dark Upheaval",
                iconSrc: "/midnight/voidspire/averzian/icons/dark-upheaval.png"
            },
            {
                name: "Gathering Darkness",
                iconSrc: "/midnight/voidspire/averzian/icons/gathering-darkness.png"
            },
            {
                name: "Gnashing Void",
                iconSrc: "/midnight/voidspire/averzian/icons/gnashing-void.png"
            },
            {
                name: "Hobbled",
                iconSrc: "/midnight/voidspire/averzian/icons/hobbled.png"
            },
            {
                name: "Imperator's Glory",
                iconSrc: "/midnight/voidspire/averzian/icons/imperators-glory.png"
            },
            {
                name: "Light's End",
                iconSrc: "/midnight/voidspire/averzian/icons/lights-end.png"
            },
            {
                name: "Oblivion's Wrath",
                iconSrc: "/midnight/voidspire/averzian/icons/oblivions-wrath.png"
            },
            {
                name: "Pitch Bulwark",
                iconSrc: "/midnight/voidspire/averzian/icons/pitch-bulwark.png"
            },
            {
                name: "Shadow's Advance",
                iconSrc: "/midnight/voidspire/averzian/icons/shadows-advance.png"
            },
            {
                name: "Umbral Barrier",
                iconSrc: "/midnight/voidspire/averzian/icons/umbral-barrier.png"
            },
            {
                name: "Umbral Collapse",
                iconSrc: "/midnight/voidspire/averzian/icons/umbral-collapse.png"
            },
            {
                name: "Void Claimed",
                iconSrc: "/midnight/voidspire/averzian/icons/void-claimed.png"
            },
            {
                name: "Void Fall",
                iconSrc: "/midnight/voidspire/averzian/icons/void-fall.png"
            },
            {
                name: "Void Rift",
                iconSrc: "/midnight/voidspire/averzian/icons/void-rift.png"
            }
        ]
      },
      {
        name: "Vorasius",
        backgrounds: [
          {
            name: "Arena",
            src: "/midnight/voidspire/vorasius/arena.png",
          },
          {
            name: "Alt",
            src: "/midnight/voidspire/vorasius/alt.png",
          },
        ],
        npcIcons: [
            gatewayIcon,
            {
                name: "Vorasius",
                iconSrc: "/midnight/voidspire/vorasius/icons/voracius.png",
            },
            {
                name: "Blistercreep",
                iconSrc: "/midnight/voidspire/vorasius/icons/blistercreep.png"
            },
        ],
        spellIcons: [
            {
                name: "Blisterburst",
                iconSrc: "/midnight/voidspire/vorasius/icons/blisterburst.png"
            },
            {
                name: "Colossal Throw",
                iconSrc: "/midnight/voidspire/vorasius/icons/colossal-throw.png"
            },
            {
                name: "Crushed",
                iconSrc: "/midnight/voidspire/vorasius/icons/crushed.png"
            },
            {
                name: "Crystal Fragments",
                iconSrc: "/midnight/voidspire/vorasius/icons/crystal-fragments.png"
            },
            {
                name: "Dark Goo",
                iconSrc: "/midnight/voidspire/vorasius/icons/dark-goo.png"
            },
            {
                name: "Overpowering Pulse",
                iconSrc: "/midnight/voidspire/vorasius/icons/overpowering-pulse.png"
            },
            {
                name: "Primordial Roar",
                iconSrc: "/midnight/voidspire/vorasius/icons/primordial-roar.png"
            },
            {
                name: "Slow Recovery",
                iconSrc: "/midnight/voidspire/vorasius/icons/slow-recovery.png"
            },
            {
                name: "Smashed",
                iconSrc: "/midnight/voidspire/vorasius/icons/smashed.png"
            },
            {
                name: "Smashing Frenzy",
                iconSrc: "/midnight/voidspire/vorasius/icons/smashing-frenzy.png"
            },
            {
                name: "Void Breath",
                iconSrc: "/midnight/voidspire/vorasius/icons/void-breath.png"
            }
        ]
      },
      {
        name: "Fallen-King Salhadaar",
        backgrounds: [
          {
            name: "Arena",
            src: "/midnight/voidspire/salhadaar/arena.png",
          },
          {
            name: "Alt",
            src: "/midnight/voidspire/salhadaar/alt.png",
          },
        ],
        npcIcons: [
            gatewayIcon,
            {
                name: "Fallen-King Salhadaar",
                iconSrc: "/midnight/voidspire/salhadaar/fallen-king-salhadaar.png",
            },
            {
                name: "Fractured Image",
                iconSrc: "/midnight/voidspire/salhadaar/fractured-image.png",
            },
                       {
                name: "Concentrated Void",
                iconSrc: "/midnight/voidspire/salhadaar/concentrated-void.png"
            },
        ],
        spellIcons: [
            {
                name: "Cosmic Unraveling",
                iconSrc: "/midnight/voidspire/salhadaar/cosmic-unraveling.png"
            },
            {
                name: "Desperate Measures",
                iconSrc: "/midnight/voidspire/salhadaar/desperate-measures.png"
            },
            {
                name: "Despotic Command",
                iconSrc: "/midnight/voidspire/salhadaar/despotic-command.png"
            },
            {
                name: "Fractured Projection",
                iconSrc: "/midnight/voidspire/salhadaar/fractured-projection.png"
            },
            {
                name: "Galactic Miasma",
                iconSrc: "/midnight/voidspire/salhadaar/galactic-miasma.png"
            },
            {
                name: "Instability",
                iconSrc: "/midnight/voidspire/salhadaar/instability.png"
            },
            {
                name: "Oppressive Darkness",
                iconSrc: "/midnight/voidspire/salhadaar/oppressive-darkness.png"
            },
            {
                name: "Quintessence",
                iconSrc: "/midnight/voidspire/salhadaar/quintessence.png"
            },
            {
                name: "Shattering Twilight",
                iconSrc: "/midnight/voidspire/salhadaar/shattering-twilight.png"
            },
            {
                name: "Torterous Residue",
                iconSrc: "/midnight/voidspire/salhadaar/torterous-residue.png"
            },
            {
                name: "Twilight Spikes",
                iconSrc: "/midnight/voidspire/salhadaar/twilight-spikes.png"
            },
            {
                name: "Twisting Obscurity",
                iconSrc: "/midnight/voidspire/salhadaar/twisting-obscurity.png"
            },
            {
                name: "Uncontainable Cosmos",
                iconSrc: "/midnight/voidspire/salhadaar/uncontainable-cosmos.png"
            },
            {
                name: "Unstable Nexus",
                iconSrc: "/midnight/voidspire/salhadaar/unstable-nexus.png"
            }
        ]
      },
      {
        name: "Vaelgor & Ezzorak",
        backgrounds: [
          {
            name: "Arena",
            src: "/midnight/voidspire/vaelgorandezzorak/arena.png",
          },
          {
            name: "Alt",
            src: "/midnight/voidspire/vaelgorandezzorak/alt.png",
          },
        ],
        npcIcons: [
            gatewayIcon,
            {
                name: "Vaelgor",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/vaelgor.png",
            },
            {
                name: "Ezzorak",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/ezzorak.png",
            },
        ],
        spellIcons: [
            {
                name: "Aura of Light",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/aura-of-light.png"
            },
            {
                name: "Cosmosis",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/cosmosis.png"
            },
            {
                name: "Dark Bolt",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/dark-bolt.png"
            },
            {
                name: "Darkhowl",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/darkhowl.png"
            },
            {
                name: "Diminish",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/diminish.png"
            },
            {
                name: "Dreadspew",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/dreadspew.png"
            },
            {
                name: "Gloom",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/gloom.png"
            },
            {
                name: "Gloomfield",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/gloomfield.png"
            },
            {
                name: "Gloomtouched",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/gloomtouched.png"
            },
            {
                name: "Impale",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/impale.png"
            },
            {
                name: "Midnight Flames",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/midnight-flames.png"
            },
            {
                name: "Midnight Manifestation",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/midnight-manifestation.png"
            },
            {
                name: "Nullscatter",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/nullscatter.png"
            },
            {
                name: "Nullsnap",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/nullsnap.png"
            },
            {
                name: "Nullzone",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/nullzone.png"
            },
            {
                name: "Nullzone Implosion",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/nullzone-implosion.png"
            },
            {
                name: "Radiant Barrier",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/radiant-barrier.png"
            },
            {
                name: "Rakfang",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/rakfang.png"
            },
            {
                name: "Shadowmark",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/shadowmark.png"
            },
            {
                name: "Snapping Maw",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/snapping-maw.png"
            },
            {
                name: "Tail Lash",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/tail-lash.png"
            },
            {
                name: "Twilight Bond",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/twilight-bond.png"
            },
            {
                name: "Twilight Fury",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/twilight-fury.png"
            },
            {
                name: "Vaelwing",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/vaelwing.png"
            },
            {
                name: "Warpsnap",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/warpsnap.png"
            },
            {
                name: "Unbound Shadow",
                iconSrc: "/midnight/voidspire/vaelgorandezzorak/unbound-shadow.png",
            }
        ]
      },
      {
        name: "Lightblinded Vanguard",
        backgrounds: [
          {
            name: "Arena",
            src: "/midnight/voidspire/lightblindedvanguard/arena.png",
          },
          {
            name: "Alt",
            src: "/midnight/voidspire/lightblindedvanguard/alt.png",
          },
        ],
        npcIcons: [
            gatewayIcon,
            {
                name: "Commander Venel Lightblood",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/commander-venel-lightblood.png",
            },
            {
                name: "General Amais Bellamy",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/general-amais-bellamy.png",
            },
            {
                name: "War Chaplain Senn",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/war-chaplain-senn.png",
            }
        ],
        spellIcons: [
            {
                name: "Aura of Devotion",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/aura-of-devotion.png"
            },
            {
                name: "Aura of Peace",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/aura-of-peace.png"
            },
            {
                name: "Aura of Wrath",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/aura-of-wrath.png"
            },
            {
                name: "Avenger's Shield",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/avengers-shield.png"
            },
            {
                name: "Divine Storm",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/divine-storm.png"
            },
            {
                name: "Divine Toll",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/divine-toll.png"
            },
            {
                name: "Execution Sentence",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/execution-sentence.png"
            },
            {
                name: "Final Verdict",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/final-verdict.png"
            },
            {
                name: "Forbearance",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/forbearance.png"
            },
            {
                name: "Holy Shock",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/holy-shock.png"
            },
            {
                name: "Judgement",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/judgement.png"
            },
            {
                name: "Light Infused",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/light-infused.png"
            },
            {
                name: "Pillar of Light",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/pillar-of-light.png"
            },
            {
                name: "Retribution",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/retribution.png"
            },
            {
                name: "Sacred Shield",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/sacred-shield.png"
            },
            {
                name: "Sacred Toll",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/sacred-toll.png"
            },
            {
                name: "Searing Radiance",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/searing-radiance.png"
            },
            {
                name: "Shield of the Righteous",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/Shield of the Righteous.png"
            },
            {
                name: "Tyr's Wrath",
                iconSrc: "/midnight/voidspire/lightblindedvanguard/tyrs-wrath.png"
            }
        ]
      },
      {
        name: "Crown of the Cosmos",
        backgrounds: [
          {
            name: "Arena",
            src: "/midnight/voidspire/crownofthecosmos/arena.png",
          },
        ],
        npcIcons: [
            gatewayIcon,
            {
                name: "Aleria Windrunner",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/aleria-windrunner.png",
            },
            {
                name: "Demiar",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/demiar.png",
            },
            {
                name: "Morium",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/morium.png",
            },
            {
                name: "Vorelus",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/vorelus.png",
            }
        ],
        spellIcons: [
            {
                name: "Aspect of the End",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/aspect-of-the-end.png"
            },
            {
                name: "Bursting Emptiness",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/bursting-emptiness.png"
            },
            {
                name: "Call of the Void",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/call-of-the-void.png"
            },
            {
                name: "Coalesced Form",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/coalesced-form.png"
            },
            {
                name: "Corrupting Essence",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/corrupting-essence.png"
            },
            {
                name: "Cosmic Barrier",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/cosmic-barrier.png"
            },
            {
                name: "Dark Hand",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/dark-hand.png"
            },
            {
                name: "Dark Rush",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/dark-rush.png"
            },
            {
                name: "Devouring Cosmos",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/devouring-cosmos.png"
            },
            {
                name: "Echoing Darkness",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/echoing-darkness.png"
            },
            {
                name: "Empowering Darkness",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/empowering-darkness.png"
            },
            {
                name: "Grasp of Emptiness",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/grasp-of-emptiness.png"
            },
            {
                name: "Gravity Collapse",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/gravity-collapse.png"
            },
            {
                name: "Null Corona",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/null-corona.png"
            },
            {
                name: "Orbiting Matter",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/orbiting-matter.png"
            },
            {
                name: "Ranger Captain's Mark",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/ranger-captains-mark.png"
            },
            {
                name: "Ravenous Abyss",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/ravenous-abyss.png"
            },
            {
                name: "Reverberating Tremor",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/reverberating-tremor.png"
            },
            {
                name: "Richocheting Arrow",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/richocheting-arrow.png"
            },
            {
                name: "Rift Slash",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/rift-slash.png"
            },
            {
                name: "Silverstrike Arrow",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/silverstrike-arrow.png"
            },
            {
                name: "Silverstrike Barrage",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/silverstrike-barrage.png"
            },
            {
                name: "Singularity Erruption",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/singularity-erruption.png"
            },
            {
                name: "Stellar Emission",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/stellar-emission.png"
            },
            {
                name: "Umbral Tether",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/umbral-tether.png"
            },
            {
                name: "Void Bolt",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/void-bolt.png"
            },
            {
                name: "Void Expulsion",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/void-expulsion.png"
            },
            {
                name: "Void Remnants",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/void-remnants.png"
            },
            {
                name: "Voidstalker Sting",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/voidstalker-sting.png"
            },
            {
                name: "Volatile Fissure",
                iconSrc: "/midnight/voidspire/crownofthecosmos/icons/volatile-fissure.png"
            }
        ]
      },
    ],
  },
  {
    raidName: "March on Quel'Danas",
    bosses: [
      {
        name: "Belo'ren, Child of Al'ar",
        backgrounds: [
          {
            name: "Full Room",
            src: "/midnight/marchonqueldanas/beloren/fullroom.png"
          },
          {
            name: "Center",
            src: "/midnight/marchonqueldanas/beloren/center.png"
          },
          {
            name: "Top",
            src: "/midnight/marchonqueldanas/beloren/top.png"
          },
        ],
        npcIcons: [
            gatewayIcon,
            {
                name: "Belo'ren, Child of Al'ar",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/beloren-child-of-alar.png",
            },
            {
                name: "Light Ember",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/light-ember.png",
            },
            {
                name: "Void Ember",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/void-ember.png",
            }
        ],
        spellIcons: [
            {
                name: "Ashen Benediction",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/ashen-benediction.png"
            },
            {
                name: "Death Drop",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/death-drop.png"
            },
            {
                name: "Embers of Belo'ren",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/embers-of-beloren.png"
            },
            {
                name: "Eternal Burns",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/eternal-burns.png"
            },
            {
                name: "Guardian's Edict",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/guardians-edict.png"
            },
            {
                name: "Holy Burn",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/holy-burn.png"
            },
            {
                name: "Immortal Flame",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/immortal-flame.png"
            },
            {
                name: "Incubation of Flames",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/incubation-of-flames.png"
            },
            {
                name: "Infused Quills",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/infused-quills.png"
            },
            {
                name: "Light Blast",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/light-blast.png"
            },
            {
                name: "Light Dive",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/light-dive.png"
            },
            {
                name: "Light Echo",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/light-echo.png"
            },
            {
                name: "Light Edict",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/light-edict.png"
            },
            {
                name: "Light Erruption",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/light-erruption.png"
            },
            {
                name: "Light Feather",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/light-feather.png"
            },
            {
                name: "Light Patch",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/light-patch.png"
            },
            {
                name: "Light Quill",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/light-quill.png"
            },
            {
                name: "Radiant Echoes",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/radiant-echoes.png"
            },
            {
                name: "Rebirth",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/rebirth.png"
            },
            {
                name: "Void Blast",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/void-blast.png"
            },
            {
                name: "Void Burn",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/void-burn.png"
            },
            {
                name: "Void Dive",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/void-dive.png"
            },
            {
                name: "Void Echo",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/void-echo.png"
            },
            {
                name: "Void Edict",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/void-edict.png"
            },
            {
                name: "Void Erruption",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/void-erruption.png"
            },
            {
                name: "Void Feather",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/void-feather.png"
            },
            {
                name: "Voidlight Convergence",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/voidlight-convergence.png"
            },
            {
                name: "Voidlight Echo",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/voidlight-echo.png"
            },
            {
                name: "Voidlight Edict",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/voidlight-edict.png"
            },
            {
                name: "Void Patch",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/void-patch.png"
            },
            {
                name: "Void Quill",
                iconSrc: "/midnight/marchonqueldanas/beloren/icons/void-quill.png"
            }
        ]
      },
      {
        name: "Midnight Falls",
        backgrounds: [
          {
            name: "Arena",
            src: "/midnight/marchonqueldanas/midnightfalls/arena.png"

          }
        ],
        npcIcons: [
            gatewayIcon,
            {
                name: "Lura",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/lura.png",
            },
            {
                name: "Dawn Crystal",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/dawn-crystal.png",
            },
            {
                name: "Dusk Crystal",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/dusk-crystal.png",
            },
            {
                name: "Midnight Crystal",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/midnight-crystal.png",
            }
        ],
        spellIcons: [
            {
                name: "Black Tide",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/black-tide.png"
            },
            {
                name: "Constellation",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/constellation.png"
            },
            {
                name: "Cosmic Fracture",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/cosmic-fracture.png"
            },
            {
                name: "Dark Meltdown",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/dark-meltdown.png"
            },
            {
                name: "Dark Rune",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/dark-rune.png"
            },
            {
                name: "Dark Toll",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/dark-toll.png"
            },
            {
                name: "Dawnlight Barrier",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/dawnlight-barrier.png"
            },
            {
                name: "Death's Dirge",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/deaths-dirge.png"
            },
            {
                name: "Death Shutter",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/death-shutter.png"
            },
            {
                name: "Dimming",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/dimming.png"
            },
            {
                name: "Disintegration",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/disintegration.png"
            },
            {
                name: "Dissonant Dirge",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/dissonant-dirge.png"
            },
            {
                name: "Extiction Ray",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/extiction-ray.png"
            },
            {
                name: "Glimmering",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/glimmering.png"
            },
            {
                name: "Heaven's Glaives",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/heavens-glaives.png"
            },
            {
                name: "Heaven's Lance",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/heavens-lance.png"
            },
            {
                name: "Impaled",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/impaled.png"
            },
            {
                name: "Light Siphon",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/light-siphon.png"
            },
            {
                name: "Midnight",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/midnight.png"
            },
            {
                name: "Naaru's Lament",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/naarus-lament.png"
            },
            {
                name: "Night's Breath",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/nights-breath.png"
            },
            {
                name: "Oblivion's Mirror",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/oblivions-mirror.png"
            },
            {
                name: "Safeguard",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/safeguard.png"
            },
            {
                name: "Safeguard Prism",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/safeguard-prism.png"
            },
            {
                name: "Shattered Sky",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/shattered-sky.png"
            },
            {
                name: "Starstrike",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/starstrike.png"
            },
            {
                name: "Stellar Implosion",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/stellar-implosion.png"
            },
            {
                name: "Tears of Lura",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/tears-of-lura.png"
            },
            {
                name: "The Black Apeture",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/the-black-apeture.png"
            },
            {
                name: "The Dark Archangel",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/the-dark-archangel.png"
            },
            {
                name: "The Darkwell",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/the-darkwell.png"
            },
            {
                name: "Torchbearer",
                iconSrc: "/midnight/marchonqueldanas/midnightfalls/icons/torchbearer.png"
            }
        ]
      }
    ]
  },
  {
    raidName: "The Venemous Abyss",
    bosses: [
      {
        name: "Nek'zali the Soulcoiler",
        backgrounds: [
          { name: "Arena", src: "/midnight/thevenemousabyss/nekzali/arena.png" }
        ],
        npcIcons: [
          gatewayIcon,
          { name: "Nek'zali", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/nekzali.png" },
          { name: "Latent Cultist", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/latent-cultist-guy.png" },
          { name: "Raised Amani", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/raised-amani.png" },
          { name: "Swirling Spirit", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/swirling-spirit.png" },
          { name: "Vessel of Awakening", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/vessel-of-awakening.png" },
        ],
        spellIcons: [
          { name: "Anguished Echoes", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/anguished-echoes.png" },
          { name: "Corpse Blight", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/corpse-blight.png" },
          { name: "Cremation", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/cremation.png" },
          { name: "Drowned Echo", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/drowned-echo.png" },
          { name: "Echo of Jawae", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/echo-of-jawae.png" },
          { name: "Entwined Step", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/entwined-step.png" },
          { name: "Essence Rend", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/essence-rend.png" },
          { name: "Grasping Depths", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/grasping-depths.png" },
          { name: "Gravebound Advance", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/gravebound-advance.png" },
          { name: "Hallowing Strikes", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/hallowing-strikes.png" },
          { name: "Hungering Pyre", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/hungering-pyre.png" },
          { name: "Immortal Coil", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/immortal-coil.png" },
          { name: "Invoke", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/invoke.png" },
          { name: "Latent Cultis", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/latent-cultis.png" },
          { name: "Possession Barrage", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/possession-barrage.png" },
          { name: "Ritual Burn", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/ritual-burn.png" },
          { name: "Slithering Flames", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/slithering-flames.png" },
          { name: "Soulcoil Ignition", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/soilcoil-iginition.png" },
          { name: "Soulcoil Rite", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/soilcoil-rite.png" },
          { name: "Soilcoiled", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/soilcoiled.png" },
          { name: "Soul Exhaustion", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/soul-exhaustion.png" },
          { name: "Soul Transfer", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/soul-transfer.png" },
          { name: "Soulcoil Well", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/soulcoil-well.png" },
          { name: "Soulcoiler's Curse", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/soulcoilers-curse.png" },
          { name: "Tether of Awakening", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/tether-of-awakening.png" },
          { name: "Uncoiled Rage", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/uncoiled-rage.png" },
          { name: "Uncoiling", iconSrc: "/midnight/thevenemousabyss/nekzali/icons/uncoiling.png" },
        ]
      },
      {
        name: "Entombed Sentinels",
        backgrounds: [
          { name: "Arena", src: "/midnight/thevenemousabyss/entombedsentinels/arena.png" }
        ],
        npcIcons: [
          gatewayIcon,
          { name: "Vashnik the Malignant", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/vashnik-the-malignant.png" },
        ],
        spellIcons: [
          { name: "Blighted Blood", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/blighted-blood.png" },
          { name: "Blood Venom", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/blood-venom.png" },
          { name: "Blood of Ula'tek", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/bloodofulatek.png" },
          { name: "Bloodvenom Injection", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/bloodvenom-injection.png" },
          { name: "Breath of Ula'tek", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/breathofulatek.png" },
          { name: "Clinging Murk", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/clinging-murk.png" },
          { name: "Contaminate", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/contaminate.png" },
          { name: "Empowering Slam", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/empowering-slam.png" },
          { name: "Helical Toxins", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/helical-toxins.png" },
          { name: "Living Venom", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/living-venom.png" },
          { name: "Mark of Acid", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/mark-of-acid.png" },
          { name: "Mark of Blood", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/mark-of-blood.png" },
          { name: "Noxious Blast", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/noxious-blast.png" },
          { name: "Protovenom Eruption", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/protovenom-erruption.png" },
          { name: "Shifting Protovenom", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/shifting-protovenom.png" },
          { name: "Toxic Droplets", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/toxic-droplets.png" },
          { name: "Ula'tek's Dominance", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/ulateks-dominance.png" },
          { name: "Unstable Miasma", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/unstable-miasma.png" },
          { name: "Venom Coagulation", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/venom-coagulation.png" },
          { name: "Vitriolic Status", iconSrc: "/midnight/thevenemousabyss/entombedsentinels/icons/vitriolic-status.png" },
        ]
      },
      {
        name: "Vashnik the Malignant",
        backgrounds: [
          { name: "Arena", src: "/midnight/thevenemousabyss/vashnik/vertical.png" }
        ],
        npcIcons: [
          gatewayIcon,
          { name: "Vashnik the Malignant", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/vashnik-the-malignant.png" },
          { name: "Malignant", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/malignant.png" },
          { name: "Malignant Totem", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/malignant-totem.png" },
        ],
        spellIcons: [
          { name: "Adaptive Injection", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/adaptive-injection.png" },
          { name: "Blood Infusion", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/blood-infusion.png" },
          { name: "Burning Presence", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/burning-presence.png" },
          { name: "Burning Venom", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/burning-venom.png" },
          { name: "Catalytic Bile", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/catalytic-bile.png" },
          { name: "Caustic Explosion", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/caustic-explosion.png" },
          { name: "Caustic Surge", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/caustic-surge.png" },
          { name: "Clotting Venom", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/clotting-venom.png" },
          { name: "Conflagrating Expulsion", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/conflagrating-expulsion.png" },
          { name: "Dripping Fangs", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/dripping-fangs.png" },
          { name: "Exploding Infection", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/exploding-infection.png" },
          { name: "Flame Infusion", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/flame-infusion.png" },
          { name: "Gloom Expulsion", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/gloom-expulsion.png" },
          { name: "Hardened Venom", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/hardened-venom.png" },
          { name: "Hemo Expulsion", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/hemo-expulsion.png" },
          { name: "Imbibe", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/imbibe.png" },
          { name: "Malignant Burst", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/malignant-burst.png" },
          { name: "Malignant Catalyst", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/malignant-catalyst.png" },
          { name: "Miasmic Coating", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/miasmic-coating.png" },
          { name: "Plague Froth", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/plague-froth.png" },
          { name: "Plague Wave", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/plague-wave.png" },
          { name: "Sanguineous Fortitude", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/sanguineous-fortitude.png" },
          { name: "Shadow Infusion", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/shadow-infusion.png" },
          { name: "Shrouded Venom", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/shrouded-venom.png" },
          { name: "Siphon Blood", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/siphon-blood.png" },
          { name: "Siphoning Infection", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/siphoning-infection.png" },
          { name: "Splitting Clot", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/splitting-clot.png" },
          { name: "Stygian Burst", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/stygian-burst.png" },
          { name: "Stygian Infection", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/stygian-infection.png" },
          { name: "Thinned Blood", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/thinned-blood.png" },
          { name: "Toxic Vapor", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/toxic-vapot.png" },
          { name: "Umbral Ejection", iconSrc: "/midnight/thevenemousabyss/vashnik/icons/umbral-ejection.png" },
        ]
      },
      {
        name: "The Lost Explorers",
        backgrounds: [
          { name: "Platform", src: "/midnight/thevenemousabyss/thelostexplorers/platform.png" }
        ],
        npcIcons: [
          gatewayIcon,
          { name: "Morzahi", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/morzahi.png" },
          { name: "Scrollsage Iku", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/scrollsage-iku.png" },
          { name: "First Mate Nama", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/first-mate-nama.png" },
          { name: "Trader Gebbo", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/trrader-gebbo.png" },
        ],
        spellIcons: [
          { name: "Aftershock", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/aftershock.png" },
          { name: "Blast Wave", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/blast-wave.png" },
          { name: "Blink Nova", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/blink-nova.png" },
          { name: "Bounce", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/bounce.png" },
          { name: "Bouncy Shroom", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/bouncy-shroom.png" },
          { name: "Burning Flames", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/burning-flames.png" },
          { name: "Cataclysmic Invocation", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/cataclysmic-invocation.png" },
          { name: "Concussive Blast", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/concussive-blast.png" },
          { name: "Dark Whispers", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/dark-whispers.png" },
          { name: "Disgusting Fish", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/disgusting-fish.png" },
          { name: "Elemental Explosion", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/elemental-explosion.png" },
          { name: "Evil Eyes", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/evil-eyes.png" },
          { name: "Explosive Surprise", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/explosive-surprise.png" },
          { name: "Final Ascension", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/final-ascension.png" },
          { name: "Fire Patch", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/fire-patch.png" },
          { name: "Fishy Feedback", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/fishy-feedback.png" },
          { name: "Frost Patch", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/frost-patch.png" },
          { name: "Frostfire Volley", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/frostfire-volley.png" },
          { name: "Fungal Burst", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/fungal-burst.png" },
          { name: "Icebound Flames", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/icebound-flames.png" },
          { name: "Malevolent Presence", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/malevolent-presence.png" },
          { name: "Mighty Thud", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/mighty-thud.png" },
          { name: "Morzahi's Command", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/morzahis-command.png" },
          { name: "Mushroom Toss", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/mushroom-toss.png" },
          { name: "Piercing Frost", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/piercing-frost.png" },
          { name: "Relentless Escalation", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/relentless-escalation.png" },
          { name: "Relic Rapture", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/relic-rapture.png" },
          { name: "Shell Spin", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/shell-spin.png" },
          { name: "Shredding Shards", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/shredding-shards.png" },
          { name: "Smashing Shovel", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/smashing-shovel.png" },
          { name: "Splinters", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/splinters.png" },
          { name: "Spreading Flames", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/spreading-flames.png" },
          { name: "Steady Strikes", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/steady-strikes.png" },
          { name: "Throw Junk", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/throw-junk.png" },
          { name: "United Defense", iconSrc: "/midnight/thevenemousabyss/thelostexplorers/icons/united-defense.png" },
        ]
      },
      {
        name: "Sszorak",
        backgrounds: [
          { name: "Platform", src: "/midnight/thevenemousabyss/sszorak/platform.png" }
        ],
        npcIcons: [
          gatewayIcon,
          { name: "Sszorak", iconSrc: "/midnight/thevenemousabyss/sszorak/sszorak.png" },
        ],
        spellIcons: [
          { name: "Apex Predator", iconSrc: "/midnight/thevenemousabyss/sszorak/apex-predator.png" },
          { name: "Caustic Claws", iconSrc: "/midnight/thevenemousabyss/sszorak/caustic-claws.png" },
          { name: "Caustic Residue", iconSrc: "/midnight/thevenemousabyss/sszorak/caustic-residue.png" },
          { name: "Corroding Venom", iconSrc: "/midnight/thevenemousabyss/sszorak/corroding-venom.png" },
          { name: "Dig In", iconSrc: "/midnight/thevenemousabyss/sszorak/dig-in.png" },
          { name: "Howling Maelstrom", iconSrc: "/midnight/thevenemousabyss/sszorak/howling-maelstrom.png" },
          { name: "Mutilate", iconSrc: "/midnight/thevenemousabyss/sszorak/mutilate.png" },
          { name: "Mutilated Gash", iconSrc: "/midnight/thevenemousabyss/sszorak/mutilated-gash.png" },
          { name: "Raging Crosswinds", iconSrc: "/midnight/thevenemousabyss/sszorak/raging-crosswinds.png" },
          { name: "Ravage", iconSrc: "/midnight/thevenemousabyss/sszorak/ravage.png" },
          { name: "Serpent's Fury", iconSrc: "/midnight/thevenemousabyss/sszorak/serpents-fury.png" },
          { name: "Tempest", iconSrc: "/midnight/thevenemousabyss/sszorak/tempest.png" },
          { name: "To the Slaughter", iconSrc: "/midnight/thevenemousabyss/sszorak/to-the-slaughter.png" },
          { name: "Ula'tek's Presence", iconSrc: "/midnight/thevenemousabyss/sszorak/ulateks-presence.png" },
          { name: "Unbound Ferocity", iconSrc: "/midnight/thevenemousabyss/sszorak/unbound-ferocity.png" },
          { name: "Venemous Surge", iconSrc: "/midnight/thevenemousabyss/sszorak/venemous-surge.png" },
          { name: "Vicious Cyst", iconSrc: "/midnight/thevenemousabyss/sszorak/vicious-cyst.png" },
          { name: "Virulence", iconSrc: "/midnight/thevenemousabyss/sszorak/virulence.png" },
        ]
      },
      {
        name: "The Twin Fangs",
        backgrounds: [
          { name: "Platform", src: "/midnight/thevenemousabyss/thetwinfangs/platform.png" }
        ],
        npcIcons: [
          gatewayIcon,
          { name: "Ithraz", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/ithraz.png" },
          { name: "Vexhul", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/vexhul.png" },
          { name: "Broodling of Ithraz", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/broodling-of-ithraz.png" },
          { name: "Spawn of Vexhul", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/spawn-of-vexhul.png" },
        ],
        spellIcons: [
          { name: "Barbed Bulwark", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/barbed-bulwark.png" },
          { name: "Blood Torrent", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/blood-torrent.png" },
          { name: "Caustic Deluge", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/caustic-deluge.png" },
          { name: "Caustic Globule", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/caustic-globule.png" },
          { name: "Clotted Bolt", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/clotted-bolt.png" },
          { name: "Coiling Ichor", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/coiling-ichor.png" },
          { name: "Concentrated Spittle", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/concentrated-spittle.png" },
          { name: "Congealed Gore", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/congealed-gore.png" },
          { name: "Corrosive Spit", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/corrosive-spit.png" },
          { name: "Envenomed", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/envenomed.png" },
          { name: "Eternal Venom", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/eternal-venom.png" },
          { name: "Feasted", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/feasted.png" },
          { name: "Noxious Slick", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/noxious-slick.png" },
          { name: "Ravenous Feast", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/ravenous-feast.png" },
          { name: "Rouse the Brood", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/rouse-the-brood.png" },
          { name: "Sanguine Storm", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/sanguine-storm.png" },
          { name: "Stir the Depths", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/stir-the-depths.png" },
          { name: "Stone Breaker", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/stone-breaker.png" },
          { name: "Submerge", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/submerge.png" },
          { name: "Tainted Burst", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/tainted-burst.png" },
          { name: "Uncoiled Wrath", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/uncoiled-wrath.png" },
          { name: "Venemous Emergence", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/venemous-emergence.png" },
          { name: "Vile Flood", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/vile-flood.png" },
          { name: "Visceral Burst", iconSrc: "/midnight/thevenemousabyss/thetwinfangs/icons/visceral-burst.png" },
        ]
      },
      {
        name: "The Coiled Altar",
        backgrounds: [
          { name: "Platform", src: "/midnight/thevenemousabyss/thecoiledaltar/platform.png" }
        ],
        npcIcons: [
          gatewayIcon,
          { name: "Hex Lord Malacrass", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/hex-lord-malacrass.png" },
          { name: "Zul'jan", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/zuljan.png" },
          { name: "Ula'tek", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/ulatek.png" },
          { name: "Fragment of Malacrass", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/fragment-of-malacrass.png" },
          { name: "Axegrinder", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/axegrinder.png" },
          { name: "Deathguard", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/deathguard.png" },
          { name: "Manifestation of Dread", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/manifestation-of-dread.png" },
          { name: "Spireful Soulcoiler", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/spireful-soilcoiler.png" },
        ],
        spellIcons: [
          { name: "Blighted Sever", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/blighted-sever.png" },
          { name: "Caustic Secretion", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/caustic-secretion.png" },
          { name: "Coalesced Venom", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/coalesced-venom.png" },
          { name: "Consumed by Resentment", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/consumed-by-resentment.png" },
          { name: "Corrupted Toxin", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/corrupted-toxin.png" },
          { name: "Death's Embrace", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/deaths-embrace.png" },
          { name: "Death's Whisper", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/deaths-whisper.png" },
          { name: "Defiled Ground", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/defiled-ground.png" },
          { name: "Defilement of the Coiled Altar", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/defilement-of-the-coiled-altar.png" },
          { name: "Dread Bolt", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/dread-bolt.png" },
          { name: "Dreadful Presence", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/dreadful-presence.png" },
          { name: "Dreadmarch", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/dreadmarch.png" },
          { name: "Eternal Nightfall", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/eternal-nightfal.png" },
          { name: "Fangs of the Coiled Altar", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/fangs-of-the-coiled-altar.png" },
          { name: "Ghastly Regeneration", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/ghastly-regeneration.png" },
          { name: "Gloombound", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/gloombound.png" },
          { name: "Gravebound", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/gravebound.png" },
          { name: "Grim Guillotine", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/grim-guillotine.png" },
          { name: "Guillotine", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/guillotine.png" },
          { name: "Malevolent Resonance", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/malevolent-ressonance.png" },
          { name: "Mutagenic Venom", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/mutagenic-venom.png" },
          { name: "Noxious Ground", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/noxious-ground.png" },
          { name: "Reclaim Essence", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/reclaim-essence.png" },
          { name: "Retaliatory Malice", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/retaliatory-malice.png" },
          { name: "Sever", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/sever.png" },
          { name: "Soul Fragment", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/soul-fragment.png" },
          { name: "Soul Sever", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/soul-sever.png" },
          { name: "Soulbinding", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/soulbinding.png" },
          { name: "Soulbound", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/soulbound.png" },
          { name: "Spirit Erasure", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/spirit-erasure.png" },
          { name: "Spirit Shield", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/spirit-shield.png" },
          { name: "Spiritcackle", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/spiritcackle.png" },
          { name: "Suffocating Darkness", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/suffocating-darkness.png" },
          { name: "Tainted Blood", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/tainted-blood.png" },
          { name: "Toxic Deluge", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/toxic-deluge.png" },
          { name: "Twinfang Toxin", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/twinfang-toxin.png" },
          { name: "Unnerving Fixation", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/unnerving-fixation.png" },
          { name: "Veil of Twilight", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/veil-of-twilight.png" },
          { name: "Venom Rupture", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/venom-rupture.png" },
          { name: "Venomfang", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/venomfang.png" },
          { name: "Virulent Cyst", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/virulent-cyst.png" },
          { name: "Virulent Mutation", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/virulent-mutation.png" },
          { name: "Volatile Venom", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/volatile-venom.png" },
          { name: "Wail of Terror", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/wail-of-terror.png" },
          { name: "Widow's Kiss", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/widows-kiss.png" },
          { name: "Widow's Touch", iconSrc: "/midnight/thevenemousabyss/thecoiledaltar/icons/widows-touch.png" },
        ]
      },
      {
        name: "Ula'tek",
        backgrounds: [
          { name: "Platform", src: "/midnight/thevenemousabyss/ulatek/platform.png" },
          { name: "Broken", src: "/midnight/thevenemousabyss/ulatek/broken.png" },
        ],
        npcIcons: [
          gatewayIcon,
          { name: "Ula'tek", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/ulatek.png" },
          { name: "Blightscale Clutch", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/blightscale-clutch.png" },
          { name: "Blightscale Rawling", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/blightscale-rawling.png" },
          { name: "Blightscale Shrieker", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/blightscale-shrieker.png" },
          { name: "Blightscale Spawn", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/blightscale-spawn.png" },
          { name: "Blightscale Viper", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/blightscale-viper.png" },
          { name: "Blightscale Wretch", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/blightscale-wretch.png" },
          { name: "Doomscale Cauldron", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/doomscale-cauldron.png" },
          { name: "Doomscale Egg", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/doomscale-egg.png" },
          { name: "Doomscale Shell", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/doomscale-shell.png" },
          { name: "Doomscale Warden", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/doomscale-warden.png" },
          { name: "Ravenous Doomscale", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/ravenous-doomscale.png" },
        ],
        spellIcons: [
          { name: "Acidic Burst", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/acidic-burst.png" },
          { name: "Acidic Expulsion", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/acidic-expulsion.png" },
          { name: "Anguished Cry", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/anguished-cry.png" },
          { name: "Blight Veil", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/blight-veil.png" },
          { name: "Boiling Venom", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/boiling-venom.png" },
          { name: "Calcified Corpse", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/calcified-corpse.png" },
          { name: "Call of the Serpent", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/call-of-the-serpent.png" },
          { name: "Caustic Waves", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/caustic-waves.png" },
          { name: "Circling Prey", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/circling-prey.png" },
          { name: "Defect Weakened", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/defect-weakened.png" },
          { name: "Desperate Thrash", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/desperate-thrash.png" },
          { name: "Dread Roar", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/dread-roar.png" },
          { name: "Falling Debris", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/falling-debris.png" },
          { name: "Fester Burst", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/fester-burst.png" },
          { name: "Fury Unleashed", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/fury-unleashed.png" },
          { name: "Gore Rattle", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/gore-rattle.png" },
          { name: "Grasping Fangs", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/grasphing-fangs.png" },
          { name: "Hardened", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/hardened.png" },
          { name: "Hatching Doom", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/hatching-doom.png" },
          { name: "Hobbled", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/hobbled.png" },
          { name: "Malice", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/malice.png" },
          { name: "Mass Gestation", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/mass-gestation.png" },
          { name: "Mephitic Thrash", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/mephitic-thrash.png" },
          { name: "Mother's Boon", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/mothers-boon.png" },
          { name: "Mother's Wrath", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/mothers-wrath.png" },
          { name: "Necrotic Vapors", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/necrotic-vapors.png" },
          { name: "Noxious Shell", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/noxious-shell.png" },
          { name: "Noxious Splash", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/noxious-splash.png" },
          { name: "Petrifying Sting", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/petrifying-sting.png" },
          { name: "Poisonous Bite", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/poisonous-bite.png" },
          { name: "Putrid Membrane", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/putrid-membrane.png" },
          { name: "Rage of the Shackled", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/rage-of-the-shackled.png" },
          { name: "Rancid Yolk", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/rancid-yolk.png" },
          { name: "Rattler Slam", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/rattler-slam.png" },
          { name: "Revenge", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/revenge.png" },
          { name: "Serpent's Bite", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/serpents-bite.png" },
          { name: "Shadow Molt", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/shadow-molt.png" },
          { name: "Slithering Clutch", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/slithering-clutch.png" },
          { name: "Soul Constrictor", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/soul-constrictor.png" },
          { name: "Spectral Coils", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/spectral-coils.png" },
          { name: "Stone Venom", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/stone-venom.png" },
          { name: "Toxic Burn", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/toxic-burn.png" },
          { name: "Toxic Womb", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/toxic-womb.png" },
          { name: "Ula'tek's Bond", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/ulateks-bond.png" },
          { name: "Unchecked Rage", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/unchecked-rage.png" },
          { name: "Venemous Heart", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/venemous-heart.png" },
          { name: "Vicious Echoes", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/vicous-echoes.png" },
          { name: "Virulent Spit", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/virulent-spit.png" },
          { name: "Volatile Purge", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/volatile-purge.png" },
          { name: "Warden's Protection", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/wardens-protection.png" },
          { name: "Writhing Gestation", iconSrc: "/midnight/thevenemousabyss/ulatek/icons/writhing-gestation.png" },
        ]
      },
    ]
  }
];

export const manaforge: RaidData = [
    {
        raidName: "Manaforge Omega",
        bosses: [
            {
                name: "Plexus Sentinel",
                backgrounds: [
                    {
                        name: "Arena",
                        src: "/tww/manaforge/plexus/arena.png"
                    }
                ],
                npcIcons: [
                    gatewayIcon,
                    {
                        name: "Plexus Sentinel",
                        iconSrc: "/tww/manaforge/plexus/icons/plexus-sentinel.png"
                    },
                ],
                spellIcons: [
                    {
                        name: "Arcane Lightning",
                        iconSrc: "/tww/manaforge/plexus/icons/arcane-lightning.png"
                    },
                    {
                        name: "Arcane Radiation",
                        iconSrc: "/tww/manaforge/plexus/icons/arcane-radiation.png"
                    },
                    {
                        name: "Arcanomatrix Atomizer",
                        iconSrc: "/tww/manaforge/plexus/icons/arcanomatrix-atomizer.png"
                    },
                    {
                        name: "Atomize",
                        iconSrc: "/tww/manaforge/plexus/icons/atomize.png"
                    },
                    {
                        name: "Displacement Matrix",
                        iconSrc: "/tww/manaforge/plexus/icons/displacement-matrix.png"
                    },
                    {
                        name: "Energy Cutter",
                        iconSrc: "/tww/manaforge/plexus/icons/energy-cutter.png"
                    },
                    {
                        name: "Energy Overload",
                        iconSrc: "/tww/manaforge/plexus/icons/energy-overload.png"
                    },
                    {
                        name: "Eradicating Salve",
                        iconSrc: "/tww/manaforge/plexus/icons/eradicating-salve.png"
                    },
                    {
                        name: "Manifest Matrices",
                        iconSrc: "/tww/manaforge/plexus/icons/manifest-matrices.png"
                    },
                    {
                        name: "Obliteration Arcanocannon",
                        iconSrc: "/tww/manaforge/plexus/icons/obliteration-arcanocannon.png"
                    },
                    {
                        name: "Phase Blink",
                        iconSrc: "/tww/manaforge/plexus/icons/phase-blink.png"
                    },
                    {
                        name: "Powered Automaton",
                        iconSrc: "/tww/manaforge/plexus/icons/powered-automaton.png"
                    },
                    {
                        name: "Protocol Purge",
                        iconSrc: "/tww/manaforge/plexus/icons/protocol-purge.png"
                    },
                    {
                        name: "Volatile Manifestation",
                        iconSrc: "/tww/manaforge/plexus/icons/volatile-manifestation.png"
                    }
                ]
            },
            {
                name: "Loomithar",
                backgrounds: [
                    {
                        name: "Arena",
                        src: "/tww/manaforge/loomithar/arena.png"
                    }
                ],
                npcIcons: [
                    gatewayIcon,
                    {
                        name: "Loomithar",
                        iconSrc: "/tww/manaforge/loomithar/icons/loomithar.png"
                    },
                ],
                spellIcons: [
                    {
                        name: "Arcane Ichor",
                        iconSrc: "/tww/manaforge/loomithar/icons/arcane-ichor.png"
                    },
                    {
                        name: "Arcane Outrage",
                        iconSrc: "/tww/manaforge/loomithar/icons/arcane-outrage.png"
                    },
                    {
                        name: "Arcane Overflow",
                        iconSrc: "/tww/manaforge/loomithar/icons/arcane-overflow.png"
                    },
                    {
                        name: "Excess Nova",
                        iconSrc: "/tww/manaforge/loomithar/icons/excess-nova.png"
                    },
                    {
                        name: "Hyper Infusion",
                        iconSrc: "/tww/manaforge/loomithar/icons/hyper-infusion.png"
                    },
                    {
                        name: "Infused Pylons",
                        iconSrc: "/tww/manaforge/loomithar/icons/infused-pylons.png"
                    },
                    {
                        name: "Infusion Tether",
                        iconSrc: "/tww/manaforge/loomithar/icons/infusion-tether.png"
                    },
                    {
                        name: "Lair Weaving",
                        iconSrc: "/tww/manaforge/loomithar/icons/lair-weaving.png"
                    },
                    {
                        name: "Living Silk",
                        iconSrc: "/tww/manaforge/loomithar/icons/living-silk.png"
                    },
                    {
                        name: "Overinfusion Burst",
                        iconSrc: "/tww/manaforge/loomithar/icons/overinfusion-burst.png"
                    },
                    {
                        name: "Piercing Strand",
                        iconSrc: "/tww/manaforge/loomithar/icons/piercing-strand.png"
                    },
                    {
                        name: "Primal Spellstorm",
                        iconSrc: "/tww/manaforge/loomithar/icons/primal-spellstorm.png"
                    },
                    {
                        name: "Silk Blast",
                        iconSrc: "/tww/manaforge/loomithar/icons/silk-blast.png"
                    },
                    {
                        name: "Undbound Rage",
                        iconSrc: "/tww/manaforge/loomithar/icons/undbound-rage.png"
                    },
                    {
                        name: "Woven Ward",
                        iconSrc: "/tww/manaforge/loomithar/icons/woven-ward.png"
                    },
                    {
                        name: "Writhing Swathe",
                        iconSrc: "/tww/manaforge/loomithar/icons/writhing-swathe.png"
                    },
                    {
                        name: "Writhing Wave",
                        iconSrc: "/tww/manaforge/loomithar/icons/writhing-wave.png"
                    }
                ]
            },
            {
                name: "Soulbinder Naazindhri",
                backgrounds: [
                    {
                        name: "Arena",
                        src: "/tww/manaforge/soulbinder/arena.png"
                    },
                    {
                        name: "Zoomed",
                        src: "/tww/manaforge/soulbinder/zoomed.png"
                    }
                ],
                npcIcons: [
                    gatewayIcon,
                    {
                        name: "Soulbinder Naazindhri",
                        iconSrc: "/tww/manaforge/soulbinder/icons/soulbinder.png"
                    },
                    {
                        name: "Shadowguard Assassin",
                        iconSrc: "/tww/manaforge/soulbinder/icons/shadowguard-assassin.png"
                    },
                    {
                        name: "Shadowguard Mage",
                        iconSrc: "/tww/manaforge/soulbinder/icons/shadowguard-mage.png"
                    },
                    {
                        name: "Shadowguard Phaseblade",
                        iconSrc: "/tww/manaforge/soulbinder/icons/shadowguard-phaseblade.png"
                    }
                ],
                spellIcons: [
                    {
                        name: "Arcane Expulsion",
                        iconSrc: "/tww/manaforge/soulbinder/icons/arcane-expulsion.png"
                    },
                    {
                        name: "Arcane Sigils",
                        iconSrc: "/tww/manaforge/soulbinder/icons/arcane-sigils.png"
                    },
                    {
                        name: "Mystic Lash",
                        iconSrc: "/tww/manaforge/soulbinder/icons/mystic-lash.png"
                    },
                    {
                        name: "Phase Blades",
                        iconSrc: "/tww/manaforge/soulbinder/icons/phase-blades.png"
                    },
                    {
                        name: "Soul Calling",
                        iconSrc: "/tww/manaforge/soulbinder/icons/soul-calling.png"
                    },
                    {
                        name: "Soulfire Convergence",
                        iconSrc: "/tww/manaforge/soulbinder/icons/soulfire-convergence.png"
                    },
                    {
                        name: "Soulfray Annihilation",
                        iconSrc: "/tww/manaforge/soulbinder/icons/soulfray-annihilation.png"
                    },
                    {
                        name: "Soulrend Orb",
                        iconSrc: "/tww/manaforge/soulbinder/icons/soulrend-orb.png"
                    },
                    {
                        name: "Soulweave",
                        iconSrc: "/tww/manaforge/soulbinder/icons/soulweave.png"
                    },
                    {
                        name: "Spellburn",
                        iconSrc: "/tww/manaforge/soulbinder/icons/spellburn.png"
                    },
                    {
                        name: "Voidblade Ambush",
                        iconSrc: "/tww/manaforge/soulbinder/icons/voidblade-ambush.png"
                    },
                    {
                        name: "Void Burst",
                        iconSrc: "/tww/manaforge/soulbinder/icons/void-burst.png"
                    },
                    {
                        name: "Void Resonance",
                        iconSrc: "/tww/manaforge/soulbinder/icons/void-resonance.png"
                    }
                ]
            },
            {
                name: "Forgeweaver Araz",
                backgrounds: [
                    {
                        name: "Arena",
                        src: "/tww/manaforge/forgeweaver/Arena.png"
                    }
                ],
                npcIcons: [
                    gatewayIcon,
                    {
                        name: "Forgeweaver Araz",
                        iconSrc: "/tww/manaforge/forgeweaver/forgeweaver-araz.png"
                    },
                    {
                        name: "Arcane Collector",
                        iconSrc: "/tww/manaforge/forgeweaver/arcane-collector.png"
                    },
                    {
                        name: "Arcane Manifestation",
                        iconSrc: "/tww/manaforge/forgeweaver/arcane-manifestation.png"
                    },
                    {
                        name: "Void Manifestation",
                        iconSrc: "/tww/manaforge/forgeweaver/void-manifestation.png"
                    }
                ],
                spellIcons: [
                    {
                        name: "Arcane Barrier",
                        iconSrc: "/tww/manaforge/forgeweaver/arcane-barrier.png"
                    },
                    {
                        name: "Arcane Convergence",
                        iconSrc: "/tww/manaforge/forgeweaver/arcane-convergence.png"
                    },
                    {
                        name: "Arcane Echo",
                        iconSrc: "/tww/manaforge/forgeweaver/arcane-echo.png"
                    },
                    {
                        name: "Arcane Expulsion",
                        iconSrc: "/tww/manaforge/forgeweaver/arcane-expulsion.png"
                    },
                    {
                        name: "Arcane Obliteration",
                        iconSrc: "/tww/manaforge/forgeweaver/arcane-obliteration.png"
                    },
                    {
                        name: "Arcane Siphon",
                        iconSrc: "/tww/manaforge/forgeweaver/arcane-siphon.png"
                    },
                    {
                        name: "Astral Burn",
                        iconSrc: "/tww/manaforge/forgeweaver/astral-burn.png"
                    },
                    {
                        name: "Astral Harvest",
                        iconSrc: "/tww/manaforge/forgeweaver/astral-harvest.png"
                    },
                    {
                        name: "Astral Mark",
                        iconSrc: "/tww/manaforge/forgeweaver/astral-mark.png"
                    },
                    {
                        name: "Astral Surge",
                        iconSrc: "/tww/manaforge/forgeweaver/astral-surge.png"
                    },
                    {
                        name: "Containment Breach",
                        iconSrc: "/tww/manaforge/forgeweaver/containment-breach.png"
                    },
                    {
                        name: "Crushing Darkness",
                        iconSrc: "/tww/manaforge/forgeweaver/crushing-darkness.png"
                    },
                    {
                        name: "Dark Singularity",
                        iconSrc: "/tww/manaforge/forgeweaver/dark-singularity.png"
                    },
                    {
                        name: "Dark Terminus",
                        iconSrc: "/tww/manaforge/forgeweaver/dark-terminus.png"
                    },
                    {
                        name: "Death Throes",
                        iconSrc: "/tww/manaforge/forgeweaver/death-throes.png"
                    },
                    {
                        name: "Echoing Tempest",
                        iconSrc: "/tww/manaforge/forgeweaver/echoing-tempest.png"
                    },
                    {
                        name: "Focusing Iris",
                        iconSrc: "/tww/manaforge/forgeweaver/focusing-iris.png"
                    },
                    {
                        name: "Hardened Shell",
                        iconSrc: "/tww/manaforge/forgeweaver/hardened-shell.png"
                    },
                    {
                        name: "Invoke Collector",
                        iconSrc: "/tww/manaforge/forgeweaver/invoke-collector.png"
                    },
                    {
                        name: "Mana Splinter",
                        iconSrc: "/tww/manaforge/forgeweaver/mana-splinter.png"
                    },
                    {
                        name: "Mark of Power",
                        iconSrc: "/tww/manaforge/forgeweaver/mark-of-power.png"
                    },
                    {
                        name: "Overwhelming Power",
                        iconSrc: "/tww/manaforge/forgeweaver/overwhelming-power.png"
                    },
                    {
                        name: "Photon Blast",
                        iconSrc: "/tww/manaforge/forgeweaver/photon-blast.png"
                    },
                    {
                        name: "Power Manifested",
                        iconSrc: "/tww/manaforge/forgeweaver/power-manifested.png"
                    },
                    {
                        name: "Prime Sequence",
                        iconSrc: "/tww/manaforge/forgeweaver/prime-sequence.png"
                    },
                    {
                        name: "Ramping Power",
                        iconSrc: "/tww/manaforge/forgeweaver/ramping-power.png"
                    },
                    {
                        name: "Shielded Attendant",
                        iconSrc: "/tww/manaforge/forgeweaver/shielded-attendant.png"
                    },
                    {
                        name: "Void Harvest",
                        iconSrc: "/tww/manaforge/forgeweaver/void-harvest.png"
                    },
                    {
                        name: "Void Surge",
                        iconSrc: "/tww/manaforge/forgeweaver/void-surge.png"
                    },
                    {
                        name: "Void Tear",
                        iconSrc: "/tww/manaforge/forgeweaver/void-tear.png"
                    }
                ]
            },
            {
                name: "Soulhunters",
                backgrounds: [
                    {
                        name: "Arena",
                        src: "/tww/manaforge/soulhunters/arena.png"
                    }
                ],
                npcIcons: [
                    gatewayIcon,
                    {
                        name: "Adarus Duskblaze",
                        iconSrc: "/tww/manaforge/soulhunters/adarus-duskblaze.png"
                    },
                    {
                        name: "Illysss Darksorrow",
                        iconSrc: "/tww/manaforge/soulhunters/illysss-darksorrow.png"
                    },
                    {
                        name: "Velaryn Bloodwrath",
                        iconSrc: "/tww/manaforge/soulhunters/velaryn-bloodwrath.png"
                    }
                ],
                spellIcons: [
                    {
                        name: "Blade Dance",
                        iconSrc: "/tww/manaforge/soulhunters/blade-dance.png"
                    },
                    {
                        name: "Collapsing Star",
                        iconSrc: "/tww/manaforge/soulhunters/collapsing-star.png"
                    },
                    {
                        name: "Consume",
                        iconSrc: "/tww/manaforge/soulhunters/consume.png"
                    },
                    {
                        name: "Dark Residue",
                        iconSrc: "/tww/manaforge/soulhunters/dark-residue.png"
                    },
                    {
                        name: "Devourer's Ire",
                        iconSrc: "/tww/manaforge/soulhunters/devourers-ire.png"
                    },
                    {
                        name: "Encroaching Oblivion",
                        iconSrc: "/tww/manaforge/soulhunters/encroaching-oblivion.png"
                    },
                    {
                        name: "Eradicate",
                        iconSrc: "/tww/manaforge/soulhunters/eradicate.png"
                    },
                    {
                        name: "Event Horizon",
                        iconSrc: "/tww/manaforge/soulhunters/event-horizon.png"
                    },
                    {
                        name: "Expulsed Soul",
                        iconSrc: "/tww/manaforge/soulhunters/expulsed-soul.png"
                    },
                    {
                        name: "Eye Beam",
                        iconSrc: "/tww/manaforge/soulhunters/eye-beam.png"
                    },
                    {
                        name: "Fel Devastation",
                        iconSrc: "/tww/manaforge/soulhunters/fel devastation.png"
                    },
                    {
                        name: "Felblade",
                        iconSrc: "/tww/manaforge/soulhunters/felblade.png"
                    },
                    {
                        name: "Fel Rush",
                        iconSrc: "/tww/manaforge/soulhunters/fel-rush.png"
                    },
                    {
                        name: "Fel Singed",
                        iconSrc: "/tww/manaforge/soulhunters/fel-singed.png"
                    },
                    {
                        name: "Fracture",
                        iconSrc: "/tww/manaforge/soulhunters/fracture.png"
                    },
                    {
                        name: "Frailty",
                        iconSrc: "/tww/manaforge/soulhunters/frailty.png"
                    },
                    {
                        name: "Hungering Slash",
                        iconSrc: "/tww/manaforge/soulhunters/hungering-slash.png"
                    },
                    {
                        name: "Immolation Aura",
                        iconSrc: "/tww/manaforge/soulhunters/immolation-aura.png"
                    },
                    {
                        name: "Infernal Strike",
                        iconSrc: "/tww/manaforge/soulhunters/infernal-strike.png"
                    },
                    {
                        name: "Shattered Soul",
                        iconSrc: "/tww/manaforge/soulhunters/shattered-soul.png"
                    },
                    {
                        name: "Sigil of Chains",
                        iconSrc: "/tww/manaforge/soulhunters/sigil-of-chains.png"
                    },
                    {
                        name: "Soulcrush",
                        iconSrc: "/tww/manaforge/soulhunters/soulcrush.png"
                    },
                    {
                        name: "Soul Tether",
                        iconSrc: "/tww/manaforge/soulhunters/soul-tether.png"
                    },
                    {
                        name: "The Hunt",
                        iconSrc: "/tww/manaforge/soulhunters/the-hunt.png"
                    },
                    {
                        name: "Unending Hunger",
                        iconSrc: "/tww/manaforge/soulhunters/unending-hunger.png"
                    },
                    {
                        name: "Unstable Soul",
                        iconSrc: "/tww/manaforge/soulhunters/unstable-soul.png"
                    },
                    {
                        name: "Voidstep",
                        iconSrc: "/tww/manaforge/soulhunters/voidstep.png"
                    },
                    {
                        name: "Weakened Prey",
                        iconSrc: "/tww/manaforge/soulhunters/weakened-prey.png"
                    },
                    {
                        name: "Withering Flames",
                        iconSrc: "/tww/manaforge/soulhunters/withering-flames.png"
                    }
                ]
            },
            {
                name: "Fractilus",
                backgrounds: [
                    {
                        name: "Arena",
                        src: "/tww/manaforge/fractilus/arena.png"
                    }
                ],
                npcIcons: [
                    gatewayIcon,
                    {
                        name: "Fractilus",
                        iconSrc: "/tww/manaforge/fractilus/icons/fractilus.png"
                    },
                    {
                        name: "Crystal Nexus",
                        iconSrc: "/tww/manaforge/fractilus/icons/crystal-nexus.png"
                    },
                    {
                        name: "Void Infused Nexus",
                        iconSrc: "/tww/manaforge/fractilus/icons/void-infused-nexus.png"
                    }
                ],
                spellIcons: [
                    {
                        name: "Brittle Nexus",
                        iconSrc: "/tww/manaforge/fractilus/icons/brittle-nexus.png"
                    },
                    {
                        name: "Crystal Encasement",
                        iconSrc: "/tww/manaforge/fractilus/icons/crystal-encasement.png"
                    },
                    {
                        name: "Crystal Laccerations",
                        iconSrc: "/tww/manaforge/fractilus/icons/crystal-laccerations.png"
                    },
                    {
                        name: "Crystalline Overcharge",
                        iconSrc: "/tww/manaforge/fractilus/icons/crystalline-overcharge.png"
                    },
                    {
                        name: "Crystalline Shockwave",
                        iconSrc: "/tww/manaforge/fractilus/icons/crystalline-shockwave.png"
                    },
                    {
                        name: "Nether Prism",
                        iconSrc: "/tww/manaforge/fractilus/icons/nether-prism.png"
                    },
                    {
                        name: "Nexus Shrapnel",
                        iconSrc: "/tww/manaforge/fractilus/icons/nexus-shrapnel.png"
                    },
                    {
                        name: "Null Consumption",
                        iconSrc: "/tww/manaforge/fractilus/icons/null-consumption.png"
                    },
                    {
                        name: "Null Explosion",
                        iconSrc: "/tww/manaforge/fractilus/icons/null-explosion.png"
                    },
                    {
                        name: "Shattering Backhand",
                        iconSrc: "/tww/manaforge/fractilus/icons/shattering-backhand.png"
                    },
                    {
                        name: "Shattershell",
                        iconSrc: "/tww/manaforge/fractilus/icons/shattershell.png"
                    },
                    {
                        name: "Shockwave Slam",
                        iconSrc: "/tww/manaforge/fractilus/icons/shockwave-slam.png"
                    }
                ]
            },
            {
                name: "Nexus-King Salhadaar",
                backgrounds: [
                    {
                        name: "Full",
                        src: "/tww/manaforge/nexusking/full.png"
                    },
                    {
                        name: "Center",
                        src: "/tww/manaforge/nexusking/center.png"
                    },
                    
                    {
                        name: "Left",
                        src: "/tww/manaforge/nexusking/left.png"
                    },
                    {
                        name: "Right",
                        src: "/tww/manaforge/nexusking/right.png"
                    }
                ],
                npcIcons: [
                    gatewayIcon,
                    {
                        name: "Nexus-King Salhadaar",
                        iconSrc: "/tww/manaforge/nexusking/icons/nexus-king-salhadaar.png"
                    },
                    {
                        name: "Nexus-Prince Kyvor",
                        iconSrc: "/tww/manaforge/nexusking/icons/nexus-prince-kyvor.png"
                    },
                    {
                        name: "Nexus-Prince Xevvos",
                        iconSrc: "/tww/manaforge/nexusking/icons/nexus-prince-xevvos.png"
                    },
                    {
                        name: "The Royal Voidwing",
                        iconSrc: "/tww/manaforge/nexusking/icons/the-royal-voidwing.png"
                    },
                    {
                        name: "King's Thrall",
                        iconSrc: "/tww/manaforge/nexusking/icons/kings-thrall.png"
                    },
                    {
                        name: "Manaforged Titan",
                        iconSrc: "/tww/manaforge/nexusking/icons/manaforged-titan.png"
                    },
                    {
                        name: "Shadowguard Reaper",
                        iconSrc: "/tww/manaforge/nexusking/icons/shadowguard-reaper.png"
                    }
                ],
                spellIcons: [
                    {
                        name: "Atomized",
                        iconSrc: "/tww/manaforge/nexusking/icons/atomized.png"
                    },
                    {
                        name: "Banishment",
                        iconSrc: "/tww/manaforge/nexusking/icons/banishment.png"
                    },
                    {
                        name: "Behead",
                        iconSrc: "/tww/manaforge/nexusking/icons/behead.png"
                    },
                    {
                        name: "Besiege",
                        iconSrc: "/tww/manaforge/nexusking/icons/besiege.png"
                    },
                    {
                        name: "Coalesce Voidwing",
                        iconSrc: "/tww/manaforge/nexusking/icons/coalesce-voidwing.png"
                    },
                    {
                        name: "Conquer",
                        iconSrc: "/tww/manaforge/nexusking/icons/conquer.png"
                    },
                    {
                        name: "Cosmic Maw",
                        iconSrc: "/tww/manaforge/nexusking/icons/cosmic-maw.png"
                    },
                    {
                        name: "Dark Orbit",
                        iconSrc: "/tww/manaforge/nexusking/icons/dark-orbit.png"
                    },
                    {
                        name: "Dark Star",
                        iconSrc: "/tww/manaforge/nexusking/icons/dark-star.png"
                    },
                    {
                        name: "Decree Oath Bound",
                        iconSrc: "/tww/manaforge/nexusking/icons/decree-oath-bound.png"
                    },
                    {
                        name: "Dimension Breath",
                        iconSrc: "/tww/manaforge/nexusking/icons/dimension-breath.png"
                    },
                    {
                        name: "Dimension Glare",
                        iconSrc: "/tww/manaforge/nexusking/icons/dimension-glare.png"
                    },
                    {
                        name: "Dread Mortar",
                        iconSrc: "/tww/manaforge/nexusking/icons/dread-mortar.png"
                    },
                    {
                        name: "Fractal Claw",
                        iconSrc: "/tww/manaforge/nexusking/icons/fractal-claw.png"
                    },
                    {
                        name: "Fractal Images",
                        iconSrc: "/tww/manaforge/nexusking/icons/fractal-images.png"
                    },
                    {
                        name: "Galactic Smash",
                        iconSrc: "/tww/manaforge/nexusking/icons/galactic-smash.png"
                    },
                    {
                        name: "Invoke the Oath",
                        iconSrc: "/tww/manaforge/nexusking/icons/invoke-the-oath.png"
                    },
                    {
                        name: "King's Hunger",
                        iconSrc: "/tww/manaforge/nexusking/icons/kings-hunger.png"
                    },
                    {
                        name: "Nether Blast",
                        iconSrc: "/tww/manaforge/nexusking/icons/nether-blast.png"
                    },
                    {
                        name: "Netherbreaker",
                        iconSrc: "/tww/manaforge/nexusking/icons/netherbreaker.png"
                    },
                    {
                        name: "Nexus Beams",
                        iconSrc: "/tww/manaforge/nexusking/icons/nexus-beams.png"
                    },
                    {
                        name: "Nexus Collapse",
                        iconSrc: "/tww/manaforge/nexusking/icons/nexus-collapse.png"
                    },
                    {
                        name: "Oath Breaker",
                        iconSrc: "/tww/manaforge/nexusking/icons/oath-breaker.png"
                    },
                    {
                        name: "Rally the Shadowguard",
                        iconSrc: "/tww/manaforge/nexusking/icons/rally-the-shadowguard.png"
                    },
                    {
                        name: "Reap",
                        iconSrc: "/tww/manaforge/nexusking/icons/reap.png"
                    },
                    {
                        name: "Royal Ward",
                        iconSrc: "/tww/manaforge/nexusking/icons/royal-ward.png"
                    },
                    {
                        name: "Seal the Forge",
                        iconSrc: "/tww/manaforge/nexusking/icons/seal-the-forge.png"
                    },
                    {
                        name: "Self Destruct",
                        iconSrc: "/tww/manaforge/nexusking/icons/self-destruct.png"
                    },
                    {
                        name: "Starkiller Nova",
                        iconSrc: "/tww/manaforge/nexusking/icons/starkiller-nova.png"
                    },
                    {
                        name: "Starkiller Swing",
                        iconSrc: "/tww/manaforge/nexusking/icons/starkiller-swing.png"
                    },
                    {
                        name: "Stars Collide",
                        iconSrc: "/tww/manaforge/nexusking/icons/stars-collide.png"
                    },
                    {
                        name: "Starshattered",
                        iconSrc: "/tww/manaforge/nexusking/icons/starshattered.png"
                    },
                    {
                        name: "Subjugation Rule",
                        iconSrc: "/tww/manaforge/nexusking/icons/subjugation-rule.png"
                    },
                    {
                        name: "Taking Aim",
                        iconSrc: "/tww/manaforge/nexusking/icons/taking-aim.png"
                    },
                    {
                        name: "Twilight Barrier",
                        iconSrc: "/tww/manaforge/nexusking/icons/twilight-barrier.png"
                    },
                    {
                        name: "Twilight Massacre",
                        iconSrc: "/tww/manaforge/nexusking/icons/twilight-massacre.png"
                    },
                    {
                        name: "Twilight Scar",
                        iconSrc: "/tww/manaforge/nexusking/icons/twilight-scar.png"
                    },
                    {
                        name: "Twilight Spikes",
                        iconSrc: "/tww/manaforge/nexusking/icons/twilight-spikes.png"
                    },
                    {
                        name: "Tyranny",
                        iconSrc: "/tww/manaforge/nexusking/icons/tyranny.png"
                    },
                    {
                        name: "Vanquish",
                        iconSrc: "/tww/manaforge/nexusking/icons/vanquish.png"
                    },
                    {
                        name: "Vengeful Oath",
                        iconSrc: "/tww/manaforge/nexusking/icons/vengeful-oath.png"
                    },
                    {
                        name: "World in Twilight",
                        iconSrc: "/tww/manaforge/nexusking/icons/world-in-twilight.png"
                    }
                ]
            },
            {
                name: "Dimensius",
                backgrounds: [
                    {
                        name: "Seat",
                        src: "/tww/manaforge/dimensius/seat.png"
                    },
                    {
                        name: "Conquest",
                        src: "/tww/manaforge/dimensius/conquest.png"
                    },
                    {
                        name: "Entropy",
                        src: "/tww/manaforge/dimensius/entropy.png"
                    },
                    {
                        name: "Heart",
                        src: "/tww/manaforge/dimensius/heart.png"
                    },
                    
                ],
                npcIcons: [
                    gatewayIcon,
                    {
                        name: "Dimensius",
                        iconSrc: "/tww/manaforge/dimensius/icons/dimensius.png"
                    },
                    {
                        name: "Artoshion",
                        iconSrc: "/tww/manaforge/dimensius/icons/artoshion.png"
                    },
                    {
                        name: "Pargoth",
                        iconSrc: "/tww/manaforge/dimensius/icons/pargoth.png"
                    },
                    {
                        name: "Roaring Reshii",
                        iconSrc: "/tww/manaforge/dimensius/icons/roaring-reshii.png"
                    }
                ],
                spellIcons: [
                    {
                        name: "Accretion Disk",
                        iconSrc: "/tww/manaforge/dimensius/icons/accretion-disk.png"
                    },
                    {
                        name: "Airborne",
                        iconSrc: "/tww/manaforge/dimensius/icons/airborne.png"
                    },
                    {
                        name: "Anomalous Force",
                        iconSrc: "/tww/manaforge/dimensius/icons/anomalous-force.png"
                    },
                    {
                        name: "Antimatter",
                        iconSrc: "/tww/manaforge/dimensius/icons/antimatter.png"
                    },
                    {
                        name: "Astrophysical Jet",
                        iconSrc: "/tww/manaforge/dimensius/icons/astrophysical-jet.png"
                    },
                    {
                        name: "Black Hole",
                        iconSrc: "/tww/manaforge/dimensius/icons/black-hole.png"
                    },
                    {
                        name: "Boundless",
                        iconSrc: "/tww/manaforge/dimensius/icons/boundless.png"
                    },
                    {
                        name: "Broken World",
                        iconSrc: "/tww/manaforge/dimensius/icons/broken-world.png"
                    },
                    {
                        name: "Collective Gravity",
                        iconSrc: "/tww/manaforge/dimensius/icons/collective-gravity.png"
                    },
                    {
                        name: "Conqueror's Cross",
                        iconSrc: "/tww/manaforge/dimensius/icons/conquerors-cross.png"
                    },
                    {
                        name: "Cosmic Radiation",
                        iconSrc: "/tww/manaforge/dimensius/icons/cosmic-radiation.png"
                    },
                    {
                        name: "Crushed",
                        iconSrc: "/tww/manaforge/dimensius/icons/crushed.png"
                    },
                    {
                        name: "Crushing Gravity",
                        iconSrc: "/tww/manaforge/dimensius/icons/crushing-gravity.png"
                    },
                    {
                        name: "Darkened Sky",
                        iconSrc: "/tww/manaforge/dimensius/icons/darkened-sky.png"
                    },
                    {
                        name: "Dark Energy",
                        iconSrc: "/tww/manaforge/dimensius/icons/dark-energy.png"
                    },
                    {
                        name: "Dark Matter",
                        iconSrc: "/tww/manaforge/dimensius/icons/dark-matter.png"
                    },
                    {
                        name: "Destabilized",
                        iconSrc: "/tww/manaforge/dimensius/icons/destabilized.png"
                    },
                    {
                        name: "Devour",
                        iconSrc: "/tww/manaforge/dimensius/icons/devour.png"
                    },
                    {
                        name: "Eclipse",
                        iconSrc: "/tww/manaforge/dimensius/icons/eclipse.png"
                    },
                    {
                        name: "Endless Darkness",
                        iconSrc: "/tww/manaforge/dimensius/icons/endless-darkness.png"
                    },
                    {
                        name: "Entropic Unity",
                        iconSrc: "/tww/manaforge/dimensius/icons/entropic-unity.png"
                    },
                    {
                        name: "Excess Mass",
                        iconSrc: "/tww/manaforge/dimensius/icons/excess-mass.png"
                    },
                    {
                        name: "Fission",
                        iconSrc: "/tww/manaforge/dimensius/icons/fission.png"
                    },
                    {
                        name: "Fists of the Voidlord",
                        iconSrc: "/tww/manaforge/dimensius/icons/fists-of-the-voidlord.png"
                    },
                    {
                        name: "Gravitational Distortion",
                        iconSrc: "/tww/manaforge/dimensius/icons/gravitational-distortion.png"
                    },
                    {
                        name: "Gravity Well",
                        iconSrc: "/tww/manaforge/dimensius/icons/gravity-well.png"
                    },
                    {
                        name: "Growing Hunger",
                        iconSrc: "/tww/manaforge/dimensius/icons/growing-hunger.png"
                    },
                    {
                        name: "Infinite Possibilities",
                        iconSrc: "/tww/manaforge/dimensius/icons/infinite-possibilities.png"
                    },
                    {
                        name: "Mass Ejection",
                        iconSrc: "/tww/manaforge/dimensius/icons/mass-ejection.png"
                    },
                    {
                        name: "Massive Smash",
                        iconSrc: "/tww/manaforge/dimensius/icons/massive-smash.png"
                    },
                    {
                        name: "Mortal Fragility",
                        iconSrc: "/tww/manaforge/dimensius/icons/mortal-fragility.png"
                    },
                    {
                        name: "Null Binding",
                        iconSrc: "/tww/manaforge/dimensius/icons/null-binding.png"
                    },
                    {
                        name: "Oblivion",
                        iconSrc: "/tww/manaforge/dimensius/icons/oblivion.png"
                    },
                    {
                        name: "Reverse Gravity",
                        iconSrc: "/tww/manaforge/dimensius/icons/reverse-gravity.png"
                    },
                    {
                        name: "Shadowquake",
                        iconSrc: "/tww/manaforge/dimensius/icons/shadowquake.png"
                    },
                    {
                        name: "Shattered Space",
                        iconSrc: "/tww/manaforge/dimensius/icons/shattered-space.png"
                    },
                    {
                        name: "Spaghetification",
                        iconSrc: "/tww/manaforge/dimensius/icons/spaghetification.png"
                    },
                    {
                        name: "Spatial Fragment",
                        iconSrc: "/tww/manaforge/dimensius/icons/spatial-fragment.png"
                    },
                    {
                        name: "Star Burst",
                        iconSrc: "/tww/manaforge/dimensius/icons/star-burst.png"
                    },
                    {
                        name: "Stellar Core",
                        iconSrc: "/tww/manaforge/dimensius/icons/stellar-core.png"
                    },
                    {
                        name: "Touch of Oblivion",
                        iconSrc: "/tww/manaforge/dimensius/icons/touch-of-oblivion.png"
                    },
                    {
                        name: "Umbral Gate",
                        iconSrc: "/tww/manaforge/dimensius/icons/umbral-gate.png"
                    },
                    {
                        name: "Voidwarding",
                        iconSrc: "/tww/manaforge/dimensius/icons/voidwarding.png"
                    }
                ]
            }
        ]
    }
]

export const undermine = []

export const nerubarpalace = []