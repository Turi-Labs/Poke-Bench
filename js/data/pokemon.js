const pokemonData = {
    pikachu: {
        name: "Pikachu",
        type: "electric",
        hp: 100,
        image: "https://placehold.co/150x150/yellow/black?text=Pikachu",
        moves: [
            { name: "Thunderbolt", type: "electric", power: 25 },
            { name: "Quick Attack", type: "normal", power: 15 },
            { name: "Iron Tail", type: "steel", power: 20 },
            { name: "Electro Ball", type: "electric", power: 22 }
        ]
    },
    charizard: {
        name: "Charizard",
        type: "fire",
        hp: 120,
        image: "https://placehold.co/150x150/orange/black?text=Charizard",
        moves: [
            { name: "Flamethrower", type: "fire", power: 25 },
            { name: "Dragon Claw", type: "dragon", power: 22 },
            { name: "Air Slash", type: "flying", power: 20 },
            { name: "Fire Blast", type: "fire", power: 30 }
        ]
    },
    blastoise: {
        name: "Blastoise",
        type: "water",
        hp: 130,
        image: "https://placehold.co/150x150/blue/white?text=Blastoise",
        moves: [
            { name: "Hydro Pump", type: "water", power: 28 },
            { name: "Ice Beam", type: "ice", power: 22 },
            { name: "Skull Bash", type: "normal", power: 25 },
            { name: "Flash Cannon", type: "steel", power: 20 }
        ]
    },
    venusaur: {
        name: "Venusaur",
        type: "grass",
        hp: 125,
        image: "https://placehold.co/150x150/green/white?text=Venusaur",
        moves: [
            { name: "Solar Beam", type: "grass", power: 30 },
            { name: "Sludge Bomb", type: "poison", power: 22 },
            { name: "Earthquake", type: "ground", power: 25 },
            { name: "Petal Dance", type: "grass", power: 24 }
        ]
    },
    jigglypuff: {
        name: "Jigglypuff",
        type: "fairy",
        hp: 95,
        image: "https://placehold.co/150x150/pink/black?text=Jigglypuff",
        moves: [
            { name: "Sing", type: "normal", power: 15 },
            { name: "Dazzling Gleam", type: "fairy", power: 22 },
            { name: "Hyper Voice", type: "normal", power: 20 },
            { name: "Pound", type: "normal", power: 18 }
        ]
    },
    gengar: {
        name: "Gengar",
        type: "ghost",
        hp: 105,
        image: "https://placehold.co/150x150/purple/white?text=Gengar",
        moves: [
            { name: "Shadow Ball", type: "ghost", power: 25 },
            { name: "Sludge Bomb", type: "poison", power: 22 },
            { name: "Thunderbolt", type: "electric", power: 20 },
            { name: "Focus Blast", type: "fighting", power: 28 }
        ]
    },
    alakazam: {
        name: "Alakazam",
        type: "psychic",
        hp: 95,
        image: "https://placehold.co/150x150/brown/white?text=Alakazam",
        moves: [
            { name: "Psychic", type: "psychic", power: 26 },
            { name: "Shadow Ball", type: "ghost", power: 22 },
            { name: "Focus Blast", type: "fighting", power: 25 },
            { name: "Energy Ball", type: "grass", power: 20 }
        ]
    },
    machamp: {
        name: "Machamp",
        type: "fighting",
        hp: 135,
        image: "https://placehold.co/150x150/gray/white?text=Machamp",
        moves: [
            { name: "Dynamic Punch", type: "fighting", power: 27 },
            { name: "Stone Edge", type: "rock", power: 25 },
            { name: "Earthquake", type: "ground", power: 24 },
            { name: "Knock Off", type: "dark", power: 20 }
        ]
    },
    gyarados: {
        name: "Gyarados",
        type: "water",
        hp: 130,
        image: "https://placehold.co/150x150/blue/white?text=Gyarados",
        moves: [
            { name: "Waterfall", type: "water", power: 25 },
            { name: "Crunch", type: "dark", power: 22 },
            { name: "Earthquake", type: "ground", power: 24 },
            { name: "Ice Fang", type: "ice", power: 20 }
        ]
    },
    dragonite: {
        name: "Dragonite",
        type: "dragon",
        hp: 140,
        image: "https://placehold.co/150x150/orange/white?text=Dragonite",
        moves: [
            { name: "Outrage", type: "dragon", power: 28 },
            { name: "Hurricane", type: "flying", power: 25 },
            { name: "Earthquake", type: "ground", power: 24 },
            { name: "Ice Punch", type: "ice", power: 20 }
        ]
    },
    tyranitar: {
        name: "Tyranitar",
        type: "rock",
        hp: 145,
        image: "https://placehold.co/150x150/gray/white?text=Tyranitar",
        moves: [
            { name: "Stone Edge", type: "rock", power: 27 },
            { name: "Crunch", type: "dark", power: 24 },
            { name: "Earthquake", type: "ground", power: 25 },
            { name: "Fire Punch", type: "fire", power: 20 }
        ]
    },
    snorlax: {
        name: "Snorlax",
        type: "normal",
        hp: 160,
        image: "https://placehold.co/150x150/darkblue/white?text=Snorlax",
        moves: [
            { name: "Body Slam", type: "normal", power: 26 },
            { name: "Earthquake", type: "ground", power: 24 },
            { name: "Fire Punch", type: "fire", power: 20 },
            { name: "Ice Punch", type: "ice", power: 20 }
        ]
    }
};

