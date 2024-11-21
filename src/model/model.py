import random
import time
import sys

while True:
    # Generate a random number between 1 and 100
    random_percentage = random.randint(1, 100)
    
    # Print it to stdout
    print(random_percentage)
    # Ensure the output is sent immediately
    sys.stdout.flush() 
    
    # Wait for 1 second
    time.sleep(1)