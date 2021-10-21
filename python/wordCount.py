# main.py
import sys

if __name__ == "__main__":
    words = sys.argv[1]
    strings = sys.argv[2]

    wordsList = words.split(",")

    wordsTuple = tuple(wordsList)

    stringsList = strings.split(",")
    trackedWords = tuple(stringsList)

    totalTrackedWords = 0

    for word in trackedWords:
        totalTrackedWords = wordsList.count(word) + totalTrackedWords

    print(totalTrackedWords)
