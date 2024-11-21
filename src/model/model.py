import random
import sys

while True:

    # Read input from stdin
    input = sys.stdin.readline().strip()

    # Generate a random number between 1 and 100
    random_percentage = random.randint(1, 100)
    
    # Print it to stdout
    print(random_percentage)
    # Ensure the output is sent immediately
    sys.stdout.flush() 
    