# config_class.py
class AnalyzerConfig:
    def __init__(self):
        self.inputPath = "/tmp/input.wav"
        self.outputPath = "/tmp/output"
        self.lat = -37.8             
        self.lon = 144.9
        self.week = 22
        self.minConfidence = 0.01
        self.sensitivity = 1.0
        
