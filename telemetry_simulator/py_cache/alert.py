from constants import *

def doctor_alert(condition):

    return AI_MESSAGES.get(condition, {})


def nurse_alert(condition):

    return {

        "title": condition,

        "actions": NURSE_ACTIONS.get(condition, [])

    }