# Pokemon League Tournament System - Architecture

## System Overview

The Pokemon League Tournament System is a competitive AI simulation where Large Language Models (LLMs) act as Pokemon trainers, selecting teams and making strategic battle decisions. The system orchestrates battles between AI trainers in a tournament format.

## Core Components

### 1. Data Layer
- **Pokemon Data** (`pokemon_data.json`): Complete Pokemon database with stats, types, and move sets
- **Moves Data** (`moves_data.json`): Move database with power, accuracy, and type information
- **Type Effectiveness** (`type_effectiveness.json`): Type matchup multipliers for damage calculation

### 2. Game Entities

#### Pokemon (`pokemon.py`)
- **State**: Name, types, base stats, current HP, status conditions, move set
- **Behaviors**: Health management, battle info exposure, opponent visibility

#### Move (`moves.py`)
- **Properties**: Name, type, power, accuracy
- **Usage**: Damage calculation input for battle mechanics

#### Trainer (`trainer.py`)
- **State**: Name, team (6 Pokemon), active Pokemon index, win/loss record
- **Behaviors**: Pokemon switching, team management, opponent move tracking
- **Memory**: Records opponent moves observed during battles

### 3. Battle System

#### Battle Mechanics (`battle_mechanics.py`)
- **Damage Calculation**: Level-based formula with STAB, type effectiveness, random factors
- **Type System**: Effectiveness multipliers (super effective, not very effective, no effect)
- **Physical/Special Split**: Determines attack/defense stats used based on move type

#### Battle Controller (`battle.py`)
- **Turn Management**: Sequential turn execution with speed-based priority
- **Action Resolution**: Handles attacks, switches, and status effects
- **State Tracking**: Battle log, turn counter, win conditions
- **Battle States**: Provides trainer-specific battle information

### 4. AI Interface Layer

#### LLM Interface (`llm.py`)
- **Prompt Generation**: Creates context-aware prompts for different decision types
- **API Communication**: Handles multiple LLM providers (OpenAI, Anthropic, Google, DeepSeek)
- **Response Parsing**: Converts LLM JSON responses to game actions
- **Fallback Logic**: Default actions when LLM responses fail

### 5. Tournament Management (`main.py`)

#### Pokemon League
- **Tournament Orchestration**: Manages bracket progression and matchmaking
- **Trainer Management**: Creates and tracks trainer records
- **Battle Coordination**: Initiates battles and processes results
- **Results Logging**: Comprehensive tournament and battle documentation

## Game Loop Architecture

### Phase 1: Tournament Initialization
```
1. Load Game Data
   ├── Pokemon Database (91 Pokemon)
   ├── Move Database (207 moves)
   └── Type Effectiveness Chart

2. Create League Instance
   ├── Initialize LLM Interface
   └── Prepare Tournament Structure

3. Generate AI Trainers
   ├── Create Trainer Objects (8 LLMs)
   └── Initialize Empty Teams
```

### Phase 2: Team Selection Process
```
For Each LLM Trainer:
1. Generate Team Selection Prompt
   ├── Present Available Pokemon (index, name, types, stats)
   ├── Request Strategic Team Composition
   └── Require JSON Response Format

2. LLM Decision Making
   ├── Analyze Pokemon Stats and Types
   ├── Consider Type Coverage Strategy
   ├── Generate Reasoning and Team Selection
   └── Return 6 Pokemon Indices

3. Team Construction
   ├── Validate Pokemon Indices
   ├── Create Pokemon Objects with Moves
   ├── Assign to Trainer Team
   └── Log Team Composition
```

### Phase 3: Tournament Bracket Execution
```
Tournament Structure: Single Elimination
├── Quarter-finals (8 → 4 trainers)
├── Semi-finals (4 → 2 trainers)
└── Finals (2 → 1 champion)

For Each Match:
1. Battle Initialization
   ├── Reset Trainer Teams (full HP)
   ├── Set Active Pokemon (index 0)
   ├── Clear Battle History
   └── Initialize Battle Controller

2. Battle Loop (max 50 turns)
   └── [See Detailed Battle Loop Below]

3. Battle Resolution
   ├── Determine Winner
   ├── Update Trainer Records
   ├── Log Battle Results
   └── Advance Winner to Next Round
```

### Phase 4: Battle Loop (Core Game Mechanics)
```
For Each Battle Turn:

1. Battle State Assessment
   ├── Check Win Conditions
   │   ├── All Pokemon Fainted → Battle Over
   │   └── Valid Pokemon Remaining → Continue
   ├── Generate Battle States
   │   ├── Trainer 1 Perspective (active Pokemon, opponent info, team status)
   │   └── Trainer 2 Perspective (active Pokemon, opponent info, team status)
   └── Check Switch Requirements
       ├── Active Pokemon Fainted → Force Switch
       └── Active Pokemon Alive → Normal Turn

2. Action Decision Phase
   ├── Handle Forced Switches (Fainted Pokemon)
   │   ├── Generate Switch Prompt (available Pokemon, opponent info)
   │   ├── LLM Chooses Replacement Pokemon
   │   ├── Execute Switch Action
   │   └── Update Battle State
   │
   ├── Generate Action Prompts
   │   ├── Include Current Battle State
   │   ├── Show Available Moves
   │   ├── Display Team Status
   │   ├── Show Known Opponent Moves
   │   └── Include Recent Battle Log
   │
   └── LLM Decision Making
       ├── Analyze Type Matchups
       ├── Consider HP and Status
       ├── Evaluate Strategic Options
       └── Choose Action: {"type": "attack", "move_index": X} OR {"type": "switch", "pokemon_index": Y}

3. Action Resolution Phase
   ├── Process Switches First
   │   ├── Validate Switch Target
   │   ├── Update Active Pokemon
   │   └── Log Switch Action
   │
   ├── Determine Move Order (Speed-based)
   │   ├── Compare Pokemon Speed Stats
   │   └── Higher Speed Moves First
   │
   └── Execute Attacks Sequentially
       ├── Validate Move Selection
       ├── Check Move Accuracy (hit/miss)
       ├── Calculate Damage
       │   ├── Base Damage Formula
       │   ├── STAB (Same Type Attack Bonus)
       │   ├── Type Effectiveness Multiplier
       │   └── Random Factor (0.85-1.0)
       ├── Apply Damage to Target
       ├── Check for Fainting
       ├── Record Move for Opponent
       └── Log Action Results

4. Turn Cleanup
   ├── Increment Turn Counter
   ├── Update Battle Log
   ├── Check Battle End Conditions
   └── Prepare Next Turn State
```

## Data Flow Architecture

### Information Visibility Rules
```
Public Information (Both Trainers):
├── Opponent Pokemon Name
├── Opponent Current/Max HP
├── Battle Log History
└── Turn Number

Private Information (Own Trainer Only):
├── Team Status (all Pokemon HP)
├── Available Moves and Stats
├── Switch Options
└── Strategic Reasoning

Learned Information (Accumulated):
├── Opponent Moves (observed during battle)
├── Opponent Pokemon Types
└── Battle History Patterns
```

### LLM Communication Protocol
```
Input Format:
├── Structured JSON Prompts
├── Battle State Context
├── Available Action Options
└── Strategic Considerations

Output Format:
├── JSON Response Required
├── Reasoning Field (logged)
├── Action Object (validated)
└── Fallback on Parse Failure

API Integration:
├── OpenAI (GPT models)
├── Anthropic (Claude models)
├── Google (Gemini models)
└── DeepSeek (DeepSeek models)
```

## State Management

### Battle State Transitions
```
1. Pre-Battle: Team Setup, Full HP
2. Battle Start: Active Pokemon Selected
3. Turn Loop: Action → Resolution → State Update
4. Pokemon Fainting: Force Switch Decision
5. Battle End: Winner Determination
6. Post-Battle: Record Update, Team Reset
```

### Persistence Layer
```
Tournament Results:
├── Battle Outcomes (trainer1 vs trainer2 → winner)
├── Turn Counts and Battle Duration
├── Team Compositions
└── LLM Reasoning Logs

Trainer Records:
├── Win/Loss Statistics
├── Team Composition History
└── Battle Performance Metrics
```

## Error Handling & Resilience

### LLM Response Failures
```
1. JSON Parse Errors → Default Action
2. Invalid Action Format → Fallback Behavior
3. API Timeouts → Retry with Default
4. Invalid Pokemon/Move Index → Safe Default
```

### Battle State Validation
```
1. Pokemon Existence Checks
2. Move Availability Validation
3. Switch Target Verification
4. HP and Status Consistency
```

## Extensibility Points

### New LLM Integration
- Add API configuration in `llm.py`
- Implement prompt formatting
- Handle response parsing
- Configure authentication

### Battle Mechanics Enhancement
- Status conditions (poison, sleep, etc.)
- Weather effects
- Ability system
- Hold items

### Tournament Formats
- Round-robin tournaments
- Swiss-system brackets
- Best-of-three matches
- League seasons

This architecture provides a clear separation of concerns while maintaining the flexibility to extend the system with additional features and LLM providers.

## System Diagrams

### High-Level System Summary

The Pokemon League Tournament System is an AI battle simulation where 8 different Large Language Models compete as Pokemon trainers in a single-elimination tournament. Each LLM selects a strategic team of 6 Pokemon and then battles other LLMs using turn-based combat with real Pokemon game mechanics.

**How it works in 4 simple steps:**
1. **Setup**: Load Pokemon data and create 8 LLM trainers
2. **Team Building**: Each LLM analyzes Pokemon stats and selects 6 Pokemon strategically  
3. **Tournament**: Single elimination bracket (Quarter-finals → Semi-finals → Finals)
4. **Battles**: Turn-based combat where LLMs choose attacks/switches based on battle state

### Simple System Flow
```
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │   SETUP     │───►│ TEAM SELECT │───►│ TOURNAMENT  │───►│   BATTLE    │
    │             │    │             │    │             │    │             │
    │ • Load data │    │ • 8 LLMs    │    │ • QF → SF   │    │ • Turn-based│
    │ • Create    │    │ • Choose 6  │    │ • → Finals  │    │ • LLM makes │
    │   trainers  │    │   Pokemon   │    │ • Brackets  │    │   decisions │
    │ • Setup APIs│    │ • Strategy  │    │ • Winners   │    │ • Damage    │
    │             │    │   analysis  │    │   advance   │    │   & effects │
    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
           │                   │                   │                   │
           ▼                   ▼                   ▼                   ▼
    Load Pokemon        LLM analyzes         Match trainers     LLM chooses:
    stats & moves       stats, types,        in bracket         • Attack move
    from JSON files     coverage needs       elimination        • Switch Pokemon
```

### Battle Turn Simplified
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BATTLE TURN CYCLE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    Both trainers get battle info ────┐
    (HP, moves, team status, etc.)    │
                                      ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                    LLM DECISIONS                            │
    │  Trainer A              │              Trainer B           │
    │ ┌─────────────┐         │         ┌─────────────────────┐   │
    │ │"Use Thunder │         │         │"Switch to Blastoise│   │
    │ │ Bolt on     │         │         │ - better type       │   │
    │ │ Gyarados"   │         │         │ matchup"            │   │
    │ └─────────────┘         │         └─────────────────────┘   │
    └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────────┐
    │                   GAME RESOLVES                             │
    │ 1. Process switches first                                   │
    │ 2. Faster Pokemon attacks first (speed stat)               │
    │ 3. Calculate damage (type effectiveness, stats, etc.)      │
    │ 4. Apply effects, check for fainting                       │
    │ 5. Update battle state & log results                       │
    └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
         Winner found OR Continue to next turn
```

### Overall System Architecture
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        POKEMON LEAGUE TOURNAMENT SYSTEM                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────────────────┐
│   DATA LAYER    │    │   GAME ENTITIES  │    │        BATTLE SYSTEM            │
├─────────────────┤    ├──────────────────┤    ├─────────────────────────────────┤
│ pokemon_data    │◄───┤ Pokemon          │◄───┤ BattleMechanics                 │
│ moves_data      │    │ ├─ name          │    │ ├─ calculate_damage()           │
│ type_effective  │    │ ├─ types         │    │ ├─ apply_damage()               │
│                 │    │ ├─ stats         │    │ └─ get_effectiveness()          │
│                 │    │ ├─ current_hp    │    │                                 │
│                 │    │ └─ moves         │    │ Battle                          │
│                 │    │                  │    │ ├─ trainer1/trainer2            │
│                 │    │ Move             │    │ ├─ turn_counter                 │
│                 │    │ ├─ name          │    │ ├─ battle_log                   │
│                 │    │ ├─ type          │    │ ├─ execute_turn()               │
│                 │    │ ├─ power         │    │ └─ get_battle_state()           │
│                 │    │ └─ accuracy      │    │                                 │
│                 │    │                  │    │                                 │
│                 │    │ Trainer          │    │                                 │
│                 │    │ ├─ name          │    │                                 │
│                 │    │ ├─ team[6]       │    │                                 │
│                 │    │ ├─ active_index  │    │                                 │
│                 │    │ └─ win/loss      │    │                                 │
└─────────────────┘    └──────────────────┘    └─────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AI INTERFACE LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│ LLMInterface                                                                    │
│ ├─ get_team_selection_prompt()                                                  │
│ ├─ get_battle_action_prompt()                                                   │
│ ├─ get_switch_decision_prompt()                                                 │
│ └─ llm_call() ──────┐                                                          │
│                     │                                                          │
│ ┌───────────────────▼────────────────────┐                                     │
│ │           API PROVIDERS                │                                     │
│ │  ┌─────────┬─────────┬─────────┬──────┐│                                     │
│ │  │ OpenAI  │Anthropic│ Google  │Others││                                     │
│ │  │ GPT-4   │ Claude  │ Gemini  │      ││                                     │
│ │  └─────────┴─────────┴─────────┴──────┘│                                     │
│ └────────────────────────────────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        TOURNAMENT MANAGEMENT                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ PokemonLeague (main.py)                                                         │
│ ├─ simulate_llm_team_selection()                                                │
│ ├─ simulate_llm_battle_action()                                                 │
│ ├─ run_battle()                                                                 │
│ └─ run_tournament()                                                             │
│                                                                                 │
│ Tournament Flow: 8 Trainers → QF → SF → Finals → Champion                      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Game Loop Flow Diagram
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             GAME LOOP FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

    START
      │
      ▼
┌─────────────────┐
│ INITIALIZATION  │
│ ├─ Load Data    │
│ ├─ Create League│
│ └─ Setup LLMs   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌──────────────────────────────────────┐
│ TEAM SELECTION  │    │ For Each LLM Trainer:                │
│ (8 Trainers)    │◄───┤ 1. Generate Selection Prompt        │
└─────────┬───────┘    │ 2. LLM Analyzes & Chooses 6 Pokemon │
          │            │ 3. Validate & Create Team           │
          │            └──────────────────────────────────────┘
          ▼
┌─────────────────┐
│ TOURNAMENT      │
│ BRACKET         │    Quarter-Finals (8→4)
│ ├─ QF Matches   │           │
│ ├─ SF Matches   │           ▼
│ └─ Final Match  │    Semi-Finals (4→2)
└─────────┬───────┘           │
          │                   ▼
          │            Finals (2→1)
          ▼                   │
┌─────────────────┐           ▼
│ BATTLE LOOP     │    ┌─────────────┐
│ (Each Match)    │◄───┤ Champion!   │
└─────────┬───────┘    └─────────────┘
          │
          ▼
    ┌─────────────┐
    │ BATTLE TURN │◄──────────────────┐
    └─────┬───────┘                   │
          │                           │
          ▼                           │
    ┌─────────────────┐               │
    │ 1. STATE CHECK  │               │
    │ ├─ Win condition│               │
    │ ├─ Battle states│               │
    │ └─ Switch needs │               │
    └─────────┬───────┘               │
              │                       │
              ▼                       │
    ┌─────────────────┐               │
    │ 2. DECISIONS    │               │
    │ ├─ Force switch │               │
    │ ├─ Gen prompts  │               │
    │ └─ LLM actions  │               │
    └─────────┬───────┘               │
              │                       │
              ▼                       │
    ┌─────────────────┐               │
    │ 3. RESOLUTION   │               │
    │ ├─ Process acts │               │
    │ ├─ Calc damage  │               │
    │ └─ Apply effects│               │
    └─────────┬───────┘               │
              │                       │
              ▼                       │
    ┌─────────────────┐               │
    │ 4. CLEANUP      │               │
    │ ├─ Update log   │               │
    │ ├─ Check end    │───────────────┤
    │ └─ Next turn    │               │
    └─────────────────┘               │
              │                       │
              └───────────────────────┘
              │ (Battle continues)
              ▼
    ┌─────────────────┐
    │ BATTLE END      │
    │ ├─ Winner found │
    │ ├─ Update stats │
    │ └─ Log results  │
    └─────────────────┘
```

### Battle Turn Detail Diagram
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          BATTLE TURN EXECUTION                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

    TURN START
        │
        ▼
┌───────────────────┐    YES  ┌──────────────────────┐
│ Active Pokemon    │────────►│ Generate Switch      │
│ Fainted?          │         │ Prompt & Execute     │
└─────────┬─────────┘         └──────────┬───────────┘
          │ NO                           │
          ▼                              ▼
┌───────────────────┐         ┌──────────────────────┐
│ Generate Battle   │         │ Update Battle State  │
│ State for Both    │◄────────┤ After Switch         │
│ Trainers          │         └──────────────────────┘
└─────────┬─────────┘
          │
          ▼
┌───────────────────────────────────────────────────────────┐
│                LLM DECISION PHASE                        │
├───────────────────────────────────────────────────────────┤
│ Trainer 1              │              Trainer 2          │
│ ┌─────────────────┐    │    ┌─────────────────────────┐   │
│ │ Prompt:         │    │    │ Prompt:                 │   │
│ │ ├─ Battle state │    │    │ ├─ Battle state         │   │
│ │ ├─ Available    │    │    │ ├─ Available moves      │   │
│ │ │   moves       │    │    │ ├─ Team status          │   │
│ │ ├─ Team status  │    │    │ └─ Known opp moves      │   │
│ │ └─ Known moves  │    │    └─────────┬───────────────┘   │
│ └─────────┬───────┘    │              │                   │
│           │            │              │                   │
│           ▼            │              ▼                   │
│ ┌─────────────────┐    │    ┌─────────────────────────┐   │
│ │ LLM Response:   │    │    │ LLM Response:           │   │
│ │ {"type":"attack"│    │    │ {"type":"switch",       │   │
│ │  "move_index":2}│    │    │  "pokemon_index":4}     │   │
│ └─────────────────┘    │    └─────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
          │                              │
          └──────────────┬───────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 ACTION RESOLUTION                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Process Switches First                                   │
│    ├─ Validate target Pokemon                               │
│    └─ Update active Pokemon                                 │
│                                                             │
│ 2. Determine Move Order (Speed-based)                       │
│    ├─ Compare Pokemon speeds                                │
│    └─ Faster Pokemon acts first                             │
│                                                             │
│ 3. Execute Attacks Sequentially                             │
│    ├─ Check accuracy (hit/miss)                             │
│    ├─ Calculate damage:                                     │
│    │   ├─ Base damage = f(level, power, atk, def)           │
│    │   ├─ STAB = 1.5x if same type                          │
│    │   ├─ Type effectiveness (0x, 0.5x, 1x, 2x)             │
│    │   └─ Random factor (0.85-1.0)                          │
│    ├─ Apply damage to target                                │
│    ├─ Check for fainting                                    │
│    └─ Record move for opponent knowledge                    │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    TURN CLEANUP                             │
├─────────────────────────────────────────────────────────────┤
│ ├─ Increment turn counter                                   │
│ ├─ Update battle log                                        │
│ ├─ Check win conditions:                                    │
│ │   ├─ All Pokemon fainted? → Battle Over                   │
│ │   └─ Valid Pokemon remain? → Continue                     │
│ └─ Prepare next turn state                                  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
                   NEXT TURN OR
                   BATTLE END
```

### Data Flow Diagram
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
    │   GAME DATA     │────────►│   GAME ENTITIES  │────────►│  BATTLE SYSTEM  │
    │ ┌─────────────┐ │         │ ┌──────────────┐ │         │ ┌─────────────┐ │
    │ │pokemon_data │ │         │ │   Pokemon    │ │         │ │Battle       │ │
    │ │moves_data   │ │         │ │   Trainer    │ │         │ │Mechanics    │ │
    │ │type_effect  │ │         │ │   Move       │ │         │ └─────────────┘ │
    │ └─────────────┘ │         │ └──────────────┘ │         └─────────────────┘
    └─────────────────┘         └──────────────────┘                   │
                                          │                            │
                                          ▼                            │
    ┌─────────────────┐         ┌──────────────────┐                   │
    │   LLM PROVIDERS │◄────────┤  LLM INTERFACE   │◄──────────────────┘
    │ ┌─────────────┐ │         │ ┌──────────────┐ │
    │ │   OpenAI    │ │         │ │Team Selection│ │
    │ │  Anthropic  │ │         │ │Battle Action │ │
    │ │   Google    │ │         │ │Switch Prompt │ │
    │ │  DeepSeek   │ │         │ └──────────────┘ │
    │ └─────────────┘ │         └──────────────────┘
    └─────────────────┘                   │
             │                            │
             ▼                            ▼
    ┌─────────────────┐         ┌──────────────────┐
    │ JSON RESPONSES  │────────►│ TOURNAMENT MGMT  │
    │ ┌─────────────┐ │         │ ┌──────────────┐ │
    │ │ Reasoning   │ │         │ │Battle Results│ │
    │ │ Team        │ │         │ │Trainer Stats │ │
    │ │ Actions     │ │         │ │Logs & Files  │ │
    │ └─────────────┘ │         │ └──────────────┘ │
    └─────────────────┘         └──────────────────┘
                                          │
                                          ▼
                               ┌──────────────────┐
                               │  OUTPUT FILES    │
                               │ ┌──────────────┐ │
                               │ │tournament_   │ │
                               │ │results.txt   │ │
                               │ │llm_reasoning │ │
                               │ │.txt          │ │
                               │ └──────────────┘ │
                               └──────────────────┘
```

### LLM Decision Flow
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           LLM DECISION PROCESS                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

INPUT: Battle State
┌─────────────────────────────────────────────────────────────────┐
│ {                                                               │
│   "turn": 5,                                                   │
│   "active_pokemon": {                                           │
│     "name": "Charizard", "types": ["Fire","Flying"],           │
│     "current_hp": 78, "stats": {...},                          │
│     "moves": [{"name":"Flamethrower",...}, {...}]              │
│   },                                                            │
│   "opponent_pokemon": {                                         │
│     "name": "Blastoise", "current_hp": 45, "max_hp": 79        │
│   },                                                            │
│   "team_status": [...], "opponent_known_moves": [...],         │
│   "last_log_entries": ["Blastoise used Water Gun!", ...]       │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   PROMPT GENERATION   │
                    │ ┌───────────────────┐ │
                    │ │ ├─ Context Setup  │ │
                    │ │ ├─ State Display  │ │
                    │ │ ├─ Move Options   │ │
                    │ │ ├─ Team Status    │ │
                    │ │ └─ JSON Format    │ │
                    │ └───────────────────┘ │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │    LLM PROCESSING     │
                    │ ┌───────────────────┐ │
                    │ │ ├─ Analyze types  │ │
                    │ │ ├─ Consider HP    │ │
                    │ │ ├─ Evaluate moves │ │
                    │ │ ├─ Plan strategy  │ │
                    │ │ └─ Choose action  │ │
                    │ └───────────────────┘ │
                    └───────────┬───────────┘
                                │
                                ▼
OUTPUT: Action Decision
┌─────────────────────────────────────────────────────────────────┐
│ {                                                               │
│   "Reasoning": "Blastoise is low on HP and Fire-type moves     │
│                 are super effective against it. Flamethrower   │
│                 should finish it off.",                        │
│   "action": {                                                  │
│     "type": "attack",                                          │
│     "move_index": 0                                            │
│   }                                                            │
│ }                                                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   RESPONSE PARSING    │
                    │ ┌───────────────────┐ │
                    │ │ ├─ Validate JSON  │ │
                    │ │ ├─ Extract action │ │
                    │ │ ├─ Log reasoning  │ │
                    │ │ └─ Handle errors  │ │
                    │ └───────────────────┘ │
                    └───────────────────────┘
```
