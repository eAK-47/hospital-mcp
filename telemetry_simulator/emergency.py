emergency = False

def toggle():
    global emergency
    emergency = not emergency
    return emergency