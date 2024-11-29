import sys
import time
import joblib

# Load the saved vectorizer and model
vectorizer = joblib.load("src/model/vectorizer.pkl")
model = joblib.load("src/model/model.pkl")

# Listen for multiple inputs in a loop
try:
    print("Model is running. Provide input to classify (Ctrl+C to exit).")
    while True:
        # Read input from stdin
        input_data = sys.stdin.readline().strip()

        # If no input is provided, wait and check again
        if not input_data:
            time.sleep(1)  # Add a delay to avoid spamming output
            continue

        # Transform the input using the vectorizer
        transformed_input = vectorizer.transform([input_data])

        # Predict using the model
        predicted_label = model.predict(transformed_input)[0]

        # Output the prediction
        print(f"Predicted Label: {predicted_label}")

except KeyboardInterrupt:
    print("\nModel stopped. Exiting...")
finally:
    sys.exit()
