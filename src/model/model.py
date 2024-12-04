import sys
import time
import joblib

# Load the saved vectorizer and model
vectorizer = joblib.load("src/model/vectorizer.pkl")
model = joblib.load("src/model/model.pkl")

print("Model is running. Provide input to classify (Ctrl+C to exit).", flush=True)

try:
    while True:
        # Read input from stdin
        input_data = sys.stdin.readline().strip()

        if input_data:
            print(f"Received input: {input_data}", flush=True)
            try:
                transformed_input = vectorizer.transform([input_data])
                predicted_label = model.predict(transformed_input)[0]

                # Multiply by 10 for percentage
                percentage = predicted_label * 10
                print(f"{percentage}", flush=True)  # Send percentage back to Node.js
            except Exception as e:
                print(f"Error: {str(e)}", flush=True)
        else:
            time.sleep(1)  # Delay before checking again to avoid busy-waiting

except KeyboardInterrupt:
    print("\nModel stopped. Exiting...", flush=True)
finally:
    sys.exit()
