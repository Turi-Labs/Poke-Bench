# Pokemon League Tournament System 🏆

A competitive AI simulation where Large Language Models (LLMs) act as Pokemon trainers, selecting teams and making strategic battle decisions in a tournament format.

## 🎯 Overview

This system orchestrates battles between 8 different LLMs in a single-elimination tournament. Each LLM:
1. **Analyzes** Pokemon stats and types
2. **Selects** a strategic team of 6 Pokemon  
3. **Battles** other LLMs using turn-based combat
4. **Makes decisions** based on real Pokemon game mechanics

## 🏗️ Project Structure

```
pokecli/
├── src/                    # Source code
│   ├── core/              # Core game entities
│   │   ├── pokemon.py     # Pokemon class with stats and moves
│   │   ├── moves.py       # Move class with power and accuracy
│   │   └── trainer.py     # Trainer class managing Pokemon teams
│   ├── battle/            # Battle system
│   │   ├── battle.py      # Battle controller and turn management
│   │   └── battle_mechanics.py  # Damage calculation and type effectiveness
│   └── ai/                # AI interface
│       └── llm.py         # LLM communication and prompt generation
├── data/                  # Game data files
│   ├── pokemon_data.json  # Pokemon database (91 Pokemon)
│   ├── moves_data.json    # Move database (207 moves)
│   └── type_effectiveness.json  # Type matchup chart
├── output/                # Generated files
│   ├── tournament_results.txt   # Battle results and statistics
│   └── llm_reasoning.txt       # LLM decision reasoning logs
├── docs/                  # Documentation
│   ├── architecture.md    # Detailed system architecture
│   └── pokemon_league_documentation.md  # Game mechanics
├── main.py               # Main tournament runner
└── requirements.txt      # Python dependencies
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- API keys for LLM providers (see Configuration section)

### Installation

1. **Clone or download the project:**
   ```bash
   git clone <repository-url>
   cd pokecli
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   Create a `.env` file in the project root:
   ```env
   # OpenAI (for GPT models)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Anthropic (for Claude models)
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # Google (for Gemini models)
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # DeepSeek (optional)
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```

4. **Run the tournament:**
   ```bash
   python main.py
   ```

## ⚙️ Configuration

### LLM Models

The system supports multiple LLM providers. Edit the `trainer_names` list in `main.py` to customize which models compete:

```python
trainer_names = [
    "gpt-4.1", "o4-mini", "o3",
    "claude-3-5-sonnet-20240620", "claude-3-7-sonnet-20250219", "claude-sonnet-4-20250514", 
    "gemini-2.5-pro", "gemini-2.5-flash"
]
```

### Tournament Settings

- **Tournament Format:** Single elimination (8 → 4 → 2 → 1)
- **Battle Limit:** 50 turns maximum per battle
- **Team Size:** 6 Pokemon per trainer
- **Pokemon Pool:** 91 available Pokemon to choose from

## 🎮 How It Works

### 1. Team Selection Phase
Each LLM receives a prompt with:
- Complete Pokemon database (stats, types, moves)
- Request for strategic team composition
- Type coverage considerations

**Example LLM reasoning:**
> "I'll select Charizard for Fire/Flying coverage, Blastoise for Water attacks, and Pikachu for Electric moves to counter Flying types..."

### 2. Tournament Bracket
```
Quarter-finals: 8 trainers → 4 winners
Semi-finals:    4 trainers → 2 winners  
Finals:         2 trainers → 1 champion
```

### 3. Battle System
Each turn, LLMs choose actions based on:
- Current Pokemon HP and stats
- Opponent's visible Pokemon
- Known opponent moves (learned during battle)
- Type effectiveness chart
- Team status

**Action Types:**
- **Attack:** Choose from 4 available moves
- **Switch:** Change to a different Pokemon

### 4. Damage Calculation
Uses authentic Pokemon mechanics:
- Base damage formula with level, power, attack/defense stats
- **STAB (Same Type Attack Bonus):** 1.5x damage for matching types
- **Type effectiveness:** 0x, 0.5x, 1x, or 2x damage multipliers
- **Random factor:** 0.85-1.0 variation
- **Speed determines move order**

## 📊 Output Files

### Tournament Results (`output/tournament_results.txt`)
- Complete battle log with turn-by-turn actions
- Winner announcements for each round
- Final trainer statistics and rankings
- Team compositions for each LLM

### LLM Reasoning (`output/llm_reasoning.txt`)
- Strategic reasoning for team selection
- Battle decision explanations
- Switch and attack justifications

## 🔧 Customization

### Adding New Pokemon
Edit `data/pokemon_data.json`:
```json
{
  "name": "NewPokemon",
  "types": ["Fire", "Dragon"],
  "stats": {
    "hp": 78,
    "attack": 84,
    "defense": 78,
    "sp_attack": 109,
    "sp_defense": 85,
    "speed": 100
  },
  "moves": ["Flamethrower", "Dragon Pulse", "Solar Beam", "Earthquake"]
}
```

### Adding New Moves
Edit `data/moves_data.json`:
```json
{
  "NewMove": {
    "type": "Fire",
    "power": 90,
    "accuracy": 100
  }
}
```

### Modifying Type Effectiveness
Edit `data/type_effectiveness.json` to change damage multipliers between types.

## 🧪 Testing

### Quick Test (2 trainers, limited Pokemon)
```python
# In main.py, change the last lines to:
if __name__ == "__main__":
    test_basic_functionality()  # Instead of main()
```

### Full Tournament
```python
if __name__ == "__main__":
    main()  # Run complete 8-trainer tournament
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors:**
   - Ensure you're running from the project root directory
   - Check that all `__init__.py` files are present

2. **API Key Issues:**
   - Verify `.env` file is in the project root
   - Check API key validity and quotas
   - Ensure `python-dotenv` is installed

3. **File Not Found Errors:**
   - Confirm data files are in the `data/` directory
   - Check that `output/` directory exists

4. **LLM Response Failures:**
   - The system includes fallback logic for invalid responses
   - Check API rate limits and connectivity
   - Review `output/llm_reasoning.txt` for debugging

### Performance Notes

- Full tournament with 8 LLMs takes 15-30 minutes depending on API response times
- Each battle averages 10-25 turns
- Total API calls: ~100-200 per tournament

## 📚 Documentation

- **[Architecture Guide](docs/architecture.md):** Detailed system design and data flow
- **[Game Documentation](docs/pokemon_league_documentation.md):** Complete game mechanics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `test_basic_functionality()`
5. Submit a pull request

## 📄 License

This project is for educational and research purposes. Pokemon is a trademark of Nintendo/Game Freak.

---

**Ready to see which AI makes the best Pokemon trainer?** 🎯

Run `python main.py` and watch the battle unfold!
