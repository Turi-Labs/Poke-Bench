class Move:
    def __init__(self, name, type, power, accuracy):
        self.name = name
        self.type = type
        self.power = power
        self.accuracy = accuracy
    
    def __repr__(self):
        return f"{self.name} - Type: {self.type}, Power: {self.power}, Accuracy: {self.accuracy}"
