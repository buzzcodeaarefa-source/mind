SPAM_WORDS = {
    "free": 2, "winner": 3, "won": 3, "prize": 3, "lottery": 3,
    "urgent": 2, "click": 2, "claim": 2, "cash": 2, "verify": 2,
    "congratulations": 2, "offer": 1, "limited": 1, "now": 1, "account": 1,
}

THRESHOLD = 4
USE_LEET = False

LEET = str.maketrans("134598$", "ieosoas")
PUNCTUATION = ".,!?;:\\'\"()"


def clean_word(word):
    word = word.lower()
    if USE_LEET:
        word = word.translate(LEET)
    return word.strip(PUNCTUATION)


def tokenize(message):
    words = []
    for word in message.split():
        cleaned = clean_word(word)
        if cleaned:
            words.append(cleaned)
    return words

def spam_score(message):
    score = 0
    for word in tokenize(message):
        score += SPAM_WORDS.get(word, 0)
    return score


def classify(message):
    if spam_score(message) >= THRESHOLD:
        return "SPAM"
    return "SAFE"


def explain(message):
    return [word for word in tokenize(message) if word in SPAM_WORDS]


TEST_MESSAGES = [
    ("Congratulations! You WON a free iPhone. Click now to claim", "SPAM"),
    ("URGENT: verify your account or it will be blocked", "SPAM"),
    ("Claim your cash prize before midnight", "SPAM"),
    ("Hey, are we still meeting at 5?", "SAFE"),
    ("Your free coding class starts at 5 PM today", "SAFE"),
    ("Mom says dinner is ready, come down now", "SAFE"),
    ("WINNER!!! click here for your prize", "SPAM"),
    ("Limited offer: free cash for new users, claim now", "SPAM"),
    ("Click the link in the class group to join the free quiz now", "SAFE"),
    ("Your bank account statement for March is ready", "SAFE"),
]

def run_tests():
    correct = false_positives = false_negatives = 0
    for message, expected in TEST_MESSAGES:
        result = classify(message)
        if result == expected:
            correct += 1
            mark = "OK"
        elif result == "SPAM":
            false_positives += 1
            mark = "FP"
        else:
            false_negatives += 1
            mark = "FN"
        print(f"{mark}  {result}  score={spam_score(message):>2}  {message}")
    print(f"\nAccuracy: {correct}/{len(TEST_MESSAGES)}")
    print(f"False positives (safe messages blocked): {false_positives}")
    print(f"False negatives (spam that got through): {false_negatives}")


if __name__ == "__main__":
    run_tests()
    print("\nType a message to check it, or 'quit' to stop.")
    while True:
        message = input("\n> ")
        if message.strip().lower() == "quit":
            break
        print(f"{classify(message)} | score: {spam_score(message)} | flagged: {explain(message)}")
