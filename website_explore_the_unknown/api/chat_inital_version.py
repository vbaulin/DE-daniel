from flask import Flask, request, jsonify
import os

app = Flask(__name__)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json() or {}
        messages = data.get("messages", [])

        # You might include logic to call an AI API/ML model.
        # For demonstration, we simply respond with a fixed message.
        system_prompt = (
            "You are an educational AI tutor. Engage in a natural and helpful conversation "
            "with the user to understand their learning/research goals and their current pre-knowledge."
        )
        # Process the messages if needed...
        simulated_response = "Simulated response from Mistral model based on input messages."

        return jsonify({"message": simulated_response}), 200
    except Exception as e:
        # Log the error as needed: print(e)
        return jsonify({"error": "Failed to process request"}), 500

if __name__ == "__main__":
    app.run(debug=True)





def generate():
            # Use the synchronous streaming API of Mistral
            stream_response = client.chat.stream(
                model=model,
                messages=combined_messages
            )
            logger.debug("Initiating streaming response")
            for chunk in stream_response:
                # Each chunk will have a 'delta' part with new content
                delta = chunk.data.choices[0].delta
                if delta and delta.content:
                    logger.debug("Sending chunk: %s", delta.content)
                    # Following the SSE convention: prefix the data with "data:" and add a double newline
                    yield f"data: {delta.content}\n\n"
            # Optionally signal that the stream is done
            yield "data: [DONE]\n\n"

        return Response(generate(), mimetype="text/event-stream")
