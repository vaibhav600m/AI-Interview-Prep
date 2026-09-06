from flask import Flask, render_template, request, jsonify

from services.ai_service import ask_ai, client


app = Flask(__name__)


# =========================
# INTERVIEW MEMORY
# =========================

interview_history = []


@app.route("/")
def home():
    return render_template("index.html")


# =========================
# CHAT API
# =========================

@app.route("/api/chat", methods=["POST"])
def chat():

    global interview_history

    data = request.get_json()

    question = data.get("question")
    language = data.get("language", "en")
    interview_mode = data.get("interviewMode", False)


    # =========================
    # RESET INTERVIEW MEMORY
    # =========================

    if data.get("resetInterview", False):

        interview_history.clear()

        return jsonify({
            "message": "Interview memory reset."
        })


    # =========================
    # END INTERVIEW
    # =========================

    if data.get("endInterview", False):

        interview_history.clear()

        return jsonify({
            "message": "Interview ended and memory cleared."
        })


    # =========================
    # QUESTION VALIDATION
    # =========================

    if not question:

        return jsonify({
            "error": "Question is required"
        }), 400


    try:

        # =========================
        # NORMAL CHAT
        # =========================

        if not interview_mode:

            answer = ask_ai(
                question,
                language,
                False
            )


        # =========================
        # MOCK INTERVIEW
        # =========================

        else:

            # Add candidate question/answer
            # to interview memory

            interview_history.append({
                "role": "user",
                "content": question
            })


            # Send interview history to AI

            answer = ask_ai(
                question,
                language,
                True,
                interview_history
            )


            # Add AI response
            # to interview memory

            interview_history.append({
                "role": "assistant",
                "content": answer
            })


        # =========================
        # SEND RESPONSE
        # =========================

        return jsonify({
            "answer": answer
        })


    except Exception as e:

        print("Error:", e)

        return jsonify({
            "error": "Something went wrong while contacting AI."
        }), 500


# =========================
# INTERVIEW EVALUATION
# =========================

@app.route("/api/interview/evaluate", methods=["POST"])
def evaluate_interview():

    global interview_history

    if not interview_history:
        return jsonify({
            "error": "No interview data available."
        }), 400

    try:

        evaluation_prompt = """
You are a professional technical interview evaluator.

Analyze the complete technical interview conversation.

Return ONLY valid JSON in exactly this structure:

{
    "overall_score": 0,
    "technical_knowledge": 0,
    "problem_solving": 0,
    "conceptual_understanding": 0,
    "communication": 0,
    "strengths": [],
    "weaknesses": [],
    "topics_to_improve": [],
    "recommendations": [],
    "final_verdict": ""
}

SCORING RULES:

All scores must be numbers from 0 to 10.

Evaluate the candidate based ONLY on what they demonstrated
during the interview.

Do not assume knowledge that the candidate did not demonstrate.

STRENGTHS:

Give 2 to 4 specific strengths.

WEAKNESSES:

Give 2 to 4 specific weaknesses.

TOPICS TO IMPROVE:

Give the specific technical topics the candidate should practice.

RECOMMENDATIONS:

Give practical and actionable recommendations.

FINAL VERDICT:

Give one short verdict such as:

"Strong Performance"
"Good Performance"
"Needs Improvement"
"Beginner Level"

IMPORTANT:

Return ONLY JSON.
Do not use markdown.
Do not add explanations outside the JSON.
"""

        conversation = "\n".join(
            [
                f"{message['role'].upper()}: {message['content']}"
                for message in interview_history
            ]
        )

        response = client.chat.completions.create(

            model="openai/gpt-oss-120b",

            messages=[
                {
                    "role": "system",
                    "content": evaluation_prompt
                },
                {
                    "role": "user",
                    "content": conversation
                }
            ],

            temperature=0.2
        )

        evaluation_text = response.choices[0].message.content.strip()

        # Convert AI JSON text into Python dictionary
        import json

        evaluation = json.loads(evaluation_text)

        return jsonify({
            "evaluation": evaluation
        })

    except Exception as e:

        print("Evaluation Error:", e)

        return jsonify({
            "error": "Unable to generate interview evaluation."
        }), 500

if __name__ == "__main__":
    app.run(debug=True)