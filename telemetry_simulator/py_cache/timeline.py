from datetime import datetime

class Timeline:

    def __init__(self):
        self.events = []

    def add(self, event):

        self.events.append({

            "time": datetime.now().strftime("%H:%M:%S"),

            "event": event

        })

    def get(self):

        return self.events