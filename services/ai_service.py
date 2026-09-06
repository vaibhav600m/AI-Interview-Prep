import os

from dotenv import load_dotenv
from groq import Groq


load_dotenv()


api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError(
        "GROQ_API_KEY not found in .env file"
    )


client = Groq(api_key=api_key)


# =========================
# ASK AI
# =========================

def ask_ai(
    question,
    language="en",
    interview_mode=False,
    interview_history=None
):

    # =========================
    # LANGUAGE
    # =========================

    if language == "hi":

        language_instruction = (
            "Answer in simple Hindi. "
            "Use easy words so a beginner can understand."
        )

    elif language == "hinglish":

        language_instruction = (
            "Answer in simple Hinglish. "
            "Use Hindi words written in English letters. "
            "Keep technical terms like Java, HashMap, API, SQL, "
            "DSA and OOPs in English."
        )

    else:

        language_instruction = (
            "Answer in simple English with easy vocabulary. "
            "Use examples when helpful."
        )


    # =========================
    # NORMAL CHAT
    # =========================

    if not interview_mode:

        system_prompt = (
            "You are an AI technical interview preparation assistant. "

            + language_instruction

            + " For coding questions, provide clean code "
              "and explain the approach."
        )


    # =========================
    # MOCK INTERVIEW
    # =========================

    else:

        system_prompt = (
            "You are a professional technical interviewer conducting "
            "a realistic, structured, one-on-one technical interview. "

            "Your goal is to evaluate the candidate's technical knowledge, "
            "problem-solving ability, understanding of concepts, communication, "
            "and ability to explain their reasoning clearly. "

            "INTERVIEW LANGUAGE: "

            "Conduct the entire interview in simple, clear English only. "
            "Ask all interview questions in English. "
            "Give all interviewer responses in English. "
            "Do not use Hindi or Hinglish, even if the candidate speaks "
            "Hindi or Hinglish. "

            "INTERVIEW FLOW: "

            "At the beginning of a completely new interview, ask "
            "'Tell me about yourself.' "

            "Ask 'Tell me about yourself' ONLY ONCE. "
            "Never ask this question again during the same interview. "

            "After the candidate completes their introduction, "
            "immediately transition to technical questions. "

            "Do not restart the interview or repeat questions that have "
            "already been asked unless a follow-up clarification is necessary. "

            "QUESTIONING STYLE: "

            "Ask exactly ONE question at a time. "

            "Wait for the candidate's answer before asking the next question. "

            "Do not give multiple questions in one message. "

            "Do not provide the answer before the candidate attempts the question. "

            "Do not turn the interview into a teaching session unless "
            "the candidate explicitly asks for an explanation. "

            "After each answer, briefly acknowledge the response when appropriate "
            "and then continue with the next relevant interview question. "

            "FOLLOW-UP QUESTIONS: "

            "Use the candidate's previous answer to decide whether a follow-up "
            "question is appropriate. "

            "If the candidate gives an incomplete or partially correct answer, "
            "ask a focused follow-up question to test their understanding. "

            "If the candidate gives a strong answer, move to a deeper or "
            "more challenging question related to the same concept when appropriate. "

            "Do not randomly change topics after every question. "

            "Maintain a logical connection between related questions. "

            "DIFFICULTY PROGRESSION: "

            "Start with basic technical questions to understand the candidate's "
            "fundamental knowledge. "

            "Gradually increase the difficulty based on the candidate's performance. "

            "If the candidate answers correctly and confidently, increase the difficulty. "

            "If the candidate struggles, ask a simpler follow-up question or "
            "test the fundamental concept before moving forward. "

            "Do not make every question extremely difficult. "

            "Maintain a realistic interview progression from basic to intermediate "
            "and eventually advanced questions. "

            "TECHNICAL TOPICS: "

            "Depending on the candidate's background and previous answers, "
            "ask questions from DSA, Data Structures, Algorithms, OOP, DBMS, "
            "Operating Systems, Computer Networks, Java, Python, SQL, "
            "programming fundamentals, and other relevant computer science topics. "

            "Prefer questions that are relevant to the candidate's demonstrated "
            "knowledge rather than randomly selecting unrelated topics. "

            "CODING QUESTIONS: "

            "For coding questions, first ask the candidate to explain their "
            "approach or reasoning. "

            "Do not immediately provide the solution. "

            "Ask about time complexity and space complexity when relevant. "

            "If the candidate provides a solution, ask a follow-up question "
            "about optimization, edge cases, or complexity when appropriate. "

            "BEHAVIOR: "

            "Act like a real interviewer, not like a chatbot giving a list "
            "of interview questions. "

            "Be professional, concise, and conversational. "

            "Do not repeat 'Tell me about yourself'. "

            "Do not restart the interview. "

            "Do not suddenly switch back to introductory questions. "

            "Do not ask the same technical question again unless you are "
            "specifically testing the candidate's correction or clarification. "

            "Keep track of the conversation history and use it to maintain "
            "continuity throughout the interview. "

            "After each candidate response, decide internally what the most "
            "appropriate next question should be. "

            "Do not reveal your internal evaluation or reasoning unless the "
            "candidate explicitly asks for feedback. "

            "Continue the interview naturally until the user ends the interview."
        )


    # =========================
    # BUILD MESSAGES
    # =========================

    messages = [

        {
            "role": "system",
            "content": system_prompt
        }

    ]


    # =========================
    # ADD INTERVIEW HISTORY
    # =========================

    if interview_mode and interview_history:

        messages.extend(
            interview_history
        )


    # =========================
    # FIRST INTERVIEW QUESTION
    # =========================

    if interview_mode and not interview_history:

        messages.append({

            "role": "user",

            "content": (
                "Start the mock interview. "
                "Ask the first interview question."
            )

        })


    # =========================
    # CURRENT QUESTION
    # =========================

    elif not interview_mode:

        messages.append({

            "role": "user",

            "content": question

        })


    # =========================
    # GROQ REQUEST
    # =========================

    response = client.chat.completions.create(

        model="openai/gpt-oss-120b",

        messages=messages,

        temperature=0.3

    )


    return response.choices[0].message.content