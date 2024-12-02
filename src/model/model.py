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
                # Transform the input using the vectorizer
                transformed_input = vectorizer.transform([input_data])
                predicted_label = model.predict(transformed_input)[0]

                # Output the prediction
                print(f"Predicted Label: {predicted_label}", flush=True)
                break  # Break after processing one input
            except Exception as e:
                print(f"Error during processing: {str(e)}", flush=True)
        else:
            # Delay before checking again to avoid busy-waiting
            time.sleep(1)

except KeyboardInterrupt:
    print("\nModel stopped. Exiting...", flush=True)
finally:
    sys.exit()
