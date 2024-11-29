import sys
import joblib

# Load the saved vectorizer and model
vectorizer = joblib.load("src/model/vectorizer.pkl")
model = joblib.load("src/model/model.pkl")

# Listen for input from WebSocket
while True:
    # Read input from Node.js process
    input_data = sys.stdin.readline().strip()
    
    # Transform the input using the vectorizer
    transformed_input = vectorizer.transform([input_data])
    
    # Predict using the model
    predicted_label = model.predict(transformed_input)[0]
    
    # Output the prediction
    print(predicted_label)
    sys.stdout.flush()
