const questionInput = document.getElementById("questionInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const chatBox = document.getElementById("chatBox");

const startInterviewBtn =
    document.getElementById("startInterviewBtn");

const endInterviewBtn =
    document.getElementById("endInterviewBtn");

let interviewMode = false;

// =========================
// INTERVIEW QUESTION COUNTER
// =========================

let interviewQuestionCount = 0;

const MAX_INTERVIEW_QUESTIONS = 20;


// =========================
// VOICE STATUS
// =========================

const voiceStatus =
    document.getElementById("voiceStatus");

const statusText =
    document.getElementById("statusText");

const liveTranscript =
    document.getElementById("liveTranscript");

const stopBtn =
    document.getElementById("stopBtn");


// =========================
// AI SPEAKING STATUS
// =========================

const speakingStatus =
    document.getElementById("speakingStatus");

const speakingText =
    document.getElementById("speakingText");

const stopSpeakingBtn =
    document.getElementById("stopSpeakingBtn");


// =========================
// VOICE SPEED
// =========================

const voiceSpeed =
    document.querySelector(".voice-speed");

const speedButtons =
    document.querySelectorAll(".speed-btn");

let currentSpeed = 1;


// =========================
// SPEECH STATE
// =========================

let currentSpeechText = "";
let currentSpeechPosition = 0;

let currentSpeechLanguage = "en";

let isSpeaking = false;


// =========================
// SEND BUTTON
// =========================

sendBtn.addEventListener("click", function () {

    sendQuestion(false);

});


// =========================
// ENTER KEY
// =========================

questionInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            sendQuestion(false);

        }

    }
);


// =========================
// SPEECH RECOGNITION
// =========================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.maxAlternatives = 3;


    // =========================
    // RECOGNITION START
    // =========================

    recognition.onstart = function () {

        micBtn.textContent = "🔴";

        micBtn.title = "Listening...";


        voiceStatus.style.display =
            "flex";


        statusText.textContent =
            "Listening...";


        liveTranscript.style.display =
            "block";


        liveTranscript.textContent =
            "Listening for your speech...";

    };


    // =========================
    // SPEECH RESULT
    // =========================

    recognition.onresult =
        function (event) {

            let transcript = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                transcript +=
                    event.results[i][0].transcript;

            }


            transcript =
                transcript.trim();


            if (transcript) {

                liveTranscript.textContent =
                    transcript;


                questionInput.value =
                    transcript;

            }

        };


    // =========================
    // RECOGNITION END
    // =========================

    recognition.onend =
        function () {

            micBtn.textContent =
                "🎤";

            micBtn.title =
                "Speak";


            voiceStatus.style.display =
                "none";


            const question =
                questionInput.value.trim();


            if (question) {

                sendQuestion(true);

            }

        };


    // =========================
    // RECOGNITION ERROR
    // =========================

    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );


            micBtn.textContent =
                "🎤";

            micBtn.title =
                "Speak";


            voiceStatus.style.display =
                "none";


            liveTranscript.textContent =
                "Could not recognize speech. Please try again.";

        };


} else {

    micBtn.disabled = true;

    micBtn.title =
        "Speech recognition is not supported";

}


// =========================
// MICROPHONE BUTTON
// =========================

micBtn.addEventListener(
    "click",
    function () {

        if (!recognition) {

            return;

        }


        try {

            recognition.start();

        } catch (error) {

            console.log(
                "Recognition already running."
            );

        }

    }
);


// =========================
// STOP LISTENING
// =========================

stopBtn.addEventListener(
    "click",
    function () {

        if (recognition) {

            recognition.stop();

        }

    }
);


// =========================
// STOP AI SPEAKING
// =========================

stopSpeakingBtn.addEventListener(
    "click",
    function () {

        if ("speechSynthesis" in window) {

            window.speechSynthesis.cancel();

            isSpeaking = false;


            speakingStatus.style.display =
                "none";


            voiceSpeed.style.display =
                "none";

        }

    }
);


// =========================
// VOICE SPEED BUTTONS
// =========================

speedButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const newSpeed =
                    parseFloat(
                        button.dataset.speed
                    );


                currentSpeed =
                    newSpeed;


                speedButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                changeSpeechSpeed(
                    newSpeed
                );

            }
        );

    }
);


// =========================
// DETECT LANGUAGE
// =========================

function detectLanguage(text) {

    // Hindi Devanagari

    if (/[\u0900-\u097F]/.test(text)) {

        return "hi";

    }


    // Common Hinglish words

    const hinglishWords = [

        "kya",
        "hai",
        "hota",
        "hoti",
        "kaise",
        "kyu",
        "kyon",
        "mera",
        "meri",
        "aap",
        "mujhe",
        "batao",
        "samjhao",
        "karna",
        "karo",
        "mein",
        "mai",
        "se",
        "ko",
        "ka",
        "ki",
        "ke"

    ];


    const words =
        text
            .toLowerCase()
            .split(/\s+/);


    let hinglishCount = 0;


    words.forEach(
        function (word) {

            if (
                hinglishWords.includes(word)
            ) {

                hinglishCount++;

            }

        }
    );


    if (hinglishCount >= 2) {

        return "hinglish";

    }


    return "en";

}


// =========================
// GENERATE INTERVIEW EVALUATION
// =========================

async function generateInterviewEvaluation() {

    try {

        const response = await fetch(
            "https://ai-interview-prep-xe2y.onrender.com/api/interview/evaluate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                }
            }
        );


        const data = await response.json();


        if (response.ok) {

            const evaluation =
                data.evaluation;


            // =========================
            // SHOW SCORECARD
            // =========================

            document.getElementById(
                "interviewEvaluation"
            ).style.display = "block";


            // =========================
            // OVERALL SCORE
            // =========================

            document.getElementById(
                "overallScore"
            ).textContent =
                evaluation.overall_score;

            document.getElementById(
                "finalVerdict"
            ).textContent =
                evaluation.final_verdict;


            // =========================
            // CATEGORY SCORES
            // =========================

            document.getElementById(
                "technicalScore"
            ).textContent =
                evaluation.technical_knowledge;

            document.getElementById(
                "problemSolvingScore"
            ).textContent =
                evaluation.problem_solving;

            document.getElementById(
                "conceptualScore"
            ).textContent =
                evaluation.conceptual_understanding;

            document.getElementById(
                "communicationScore"
            ).textContent =
                evaluation.communication;


            // =========================
            // PROGRESS BARS
            // =========================

            document.getElementById(
                "technicalProgress"
            ).style.width =
                (evaluation.technical_knowledge * 10) + "%";

            document.getElementById(
                "problemSolvingProgress"
            ).style.width =
                (evaluation.problem_solving * 10) + "%";

            document.getElementById(
                "conceptualProgress"
            ).style.width =
                (evaluation.conceptual_understanding * 10) + "%";

            document.getElementById(
                "communicationProgress"
            ).style.width =
                (evaluation.communication * 10) + "%";


            // =========================
            // OVERALL SCORE CIRCLE
            // =========================

            const scoreCircle =
                document.querySelector(".score-circle");

            if (scoreCircle) {

                const percentage =
                    evaluation.overall_score * 10;

                const degrees =
                    percentage * 3.6;

                scoreCircle.style.background =
                    `conic-gradient(
                        #222 ${degrees}deg,
                        #e5e7eb ${degrees}deg
                    )`;
            }


            // =========================
            // FILL LISTS
            // =========================

            function fillList(
                elementId,
                items
            ) {

                const list =
                    document.getElementById(
                        elementId
                    );

                list.innerHTML = "";

                items.forEach(function (item) {

                    const li =
                        document.createElement("li");

                    li.textContent = item;

                    list.appendChild(li);

                });
            }


            fillList(
                "strengthsList",
                evaluation.strengths
            );

            fillList(
                "weaknessesList",
                evaluation.weaknesses
            );

            fillList(
                "topicsList",
                evaluation.topics_to_improve
            );

            fillList(
                "recommendationsList",
                evaluation.recommendations
            );


            // =========================
            // SCROLL TO SCORECARD
            // =========================

            document.getElementById(
                "interviewEvaluation"
            ).scrollIntoView({
                behavior: "smooth"
            });


            return true;

        } else {

            console.error(
                "Evaluation error:",
                data.error
            );

            return false;
        }


    } catch (error) {

        console.error(
            "Evaluation error:",
            error
        );

        return false;
    }
}

// =========================
// SEND QUESTION
// =========================

async function sendQuestion(isVoice = false) {

    const question =
        questionInput.value.trim();


    if (!question) {
        return;
    }


    // =========================
    // HIDE OLD SCORECARD
    // FOR NORMAL CHAT
    // =========================

    if (!interviewMode) {

        const interviewEvaluation =
            document.getElementById("interviewEvaluation");

        if (interviewEvaluation) {
            interviewEvaluation.style.display = "none";
        }
    }


    // =========================
    // DETECT LANGUAGE
    // =========================

    const language =
        detectLanguage(question);


    console.log(
        "Detected language:",
        language
    );


    // =========================
    // ADD USER MESSAGE
    // =========================

    addMessage(
        question,
        "user"
    );


    // Clear input

    questionInput.value = "";


    // =========================
    // SHOW AI THINKING
    // =========================

    const thinkingMessage =
        document.createElement("div");

    thinkingMessage.classList.add(
        "message",
        "ai",
        "thinking-message"
    );

    thinkingMessage.innerHTML =
        "⏳ AI is thinking...";

    chatBox.appendChild(
        thinkingMessage
    );

    chatBox.scrollTop =
        chatBox.scrollHeight;


    try {

        // =========================
        // SEND REQUEST TO BACKEND
        // =========================

        const response =
            await fetch(
                "https://ai-interview-prep-xe2y.onrender.com/api/chat",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        question:
                            question,

                        language:
                            language,

                        interviewMode:
                            interviewMode

                    })

                }
            );


        // =========================
        // READ RESPONSE SAFELY
        // =========================

        let data;

        try {

            data =
                await response.json();

        } catch (jsonError) {

            throw new Error(
                "Invalid response from server."
            );
        }


        // =========================
        // REMOVE THINKING
        // =========================

        if (thinkingMessage) {
            thinkingMessage.remove();
        }


        // =========================
        // HANDLE API ERROR
        // =========================

        if (!response.ok) {

            addMessage(
                "❌ " +
                (
                    data.error ||
                    "Unable to get a response from AI."
                ),
                "ai"
            );

            return;
        }


        // =========================
        // CHECK ANSWER
        // =========================

        if (!data.answer) {

            addMessage(
                "❌ AI did not return an answer. Please try again.",
                "ai"
            );

            return;
        }


        // =========================
        // ADD AI ANSWER
        // =========================

        addMessage(
            data.answer,
            "ai"
        );


        // =========================
        // SPEAK AI ANSWER
        // =========================

        if (isVoice) {

            speakAnswer(
                data.answer,
                language
            );
        }


        // =================================================
        // INTERVIEW QUESTION COUNTER
        // =================================================

        if (interviewMode) {

            interviewQuestionCount++;


            document.getElementById(
                "currentQuestion"
            ).textContent =
                interviewQuestionCount;


            console.log(
                "Interview question:",
                interviewQuestionCount,
                "/",
                MAX_INTERVIEW_QUESTIONS
            );


            // =========================
            // CHECK INTERVIEW COMPLETE
            // =========================

            if (
                interviewQuestionCount >=
                MAX_INTERVIEW_QUESTIONS
            ) {

                // Disable input

                questionInput.disabled = true;
                sendBtn.disabled = true;
                micBtn.disabled = true;


                // Stop AI speech

                if (
                    "speechSynthesis"
                    in window
                ) {

                    window.speechSynthesis.cancel();
                }


                if (
                    typeof isSpeaking !==
                    "undefined"
                ) {

                    isSpeaking = false;
                }


                if (
                    typeof speakingStatus !==
                    "undefined"
                ) {

                    speakingStatus.style.display =
                        "none";
                }


                // =========================
                // COMPLETION MESSAGE
                // =========================

                addMessage(
                    "🎉 **Mock Interview Completed!**\n\n" +
                    "You have completed all " +
                    MAX_INTERVIEW_QUESTIONS +
                    " questions.\n\n" +
                    "📊 Generating your evaluation...",
                    "ai"
                );


                // =========================
                // GENERATE EVALUATION
                // =========================

                const evaluationGenerated =
                    await generateInterviewEvaluation();


                // =========================
                // EVALUATION SUCCESS
                // =========================

                if (evaluationGenerated) {

                    interviewMode =
                        false;


                    startInterviewBtn.style.display =
                        "inline-block";


                    endInterviewBtn.style.display =
                        "none";


                    // Hide counter

                    document.getElementById(
                        "questionCounter"
                    ).style.display =
                        "none";


                    // =========================
                    // CLEAR INTERVIEW MEMORY
                    // =========================

                    try {

                        const clearResponse =
                            await fetch(
                                "/api/chat",
                                {

                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body: JSON.stringify({
                                        endInterview: true
                                    })

                                }
                            );


                        if (!clearResponse.ok) {

                            console.error(
                                "Interview memory could not be cleared."
                            );
                        }

                    } catch (error) {

                        console.error(
                            "Could not clear interview memory:",
                            error
                        );
                    }


                    // =========================
                    // ENABLE NORMAL CHAT
                    // =========================

                    questionInput.disabled =
                        false;

                    sendBtn.disabled =
                        false;

                    micBtn.disabled =
                        false;

                } else {

                    // =========================
                    // EVALUATION FAILED
                    // =========================

                    addMessage(
                        "❌ Evaluation could not be generated. " +
                        "Please try again.",
                        "ai"
                    );


                    // Allow user to continue

                    questionInput.disabled =
                        false;

                    sendBtn.disabled =
                        false;

                    micBtn.disabled =
                        false;
                }
            }
        }


    } catch (error) {

        // =========================
        // REMOVE THINKING
        // =========================

        if (thinkingMessage) {
            thinkingMessage.remove();
        }


        // =========================
        // NETWORK / SERVER ERROR
        // =========================

        addMessage(
            "❌ Unable to connect to the AI server. " +
            "Please check your connection and try again.",
            "ai"
        );


        console.error(
            "Chat Error:",
            error
        );
    }

}


// =========================
// SPEAK AI ANSWER
// =========================

function speakAnswer(
    text,
    language = "en"
) {

    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    // Stop previous speech

    window.speechSynthesis.cancel();


    // Save complete answer

    currentSpeechText =
        text;


    currentSpeechPosition =
        0;


    // Save language

    currentSpeechLanguage =
        language;


    // Start speaking

    speakFromPosition();

}


// =========================
// SPEAK FROM CURRENT POSITION
// =========================

function speakFromPosition() {

    if (!currentSpeechText) {
        return;
    }


    const remainingText =
        currentSpeechText.substring(
            currentSpeechPosition
        );


    if (!remainingText.trim()) {
        return;
    }


    const speech =
        new SpeechSynthesisUtterance(
            remainingText
        );


    // =========================
    // ENGLISH VOICE
    // =========================

    speech.lang = "en-US";


    const voices =
        availableVoices.length
            ? availableVoices
            : window.speechSynthesis.getVoices();


    // Prefer clear English voices

    const preferredVoice =
        voices.find(
            voice =>
                voice.lang === "en-US" &&
                (
                    voice.name.includes("Google") ||
                    voice.name.includes("Samantha") ||
                    voice.name.includes("Microsoft")
                )
        );


    if (preferredVoice) {

        speech.voice =
            preferredVoice;

    } else {

        // Fallback to any English voice

        const englishVoice =
            voices.find(
                voice =>
                    voice.lang.startsWith("en")
            );

        if (englishVoice) {

            speech.voice =
                englishVoice;

        }

    }


    // =========================
    // VOICE SPEED
    // =========================

    speech.rate =
        currentSpeed;


    // Slightly natural pitch

    speech.pitch =
        1;


    // =========================
    // SPEECH START
    // =========================

    speech.onstart =
        function () {

            isSpeaking =
                true;


            speakingStatus.style.display =
                "flex";


            speakingText.textContent =
                "AI is speaking...";


            voiceSpeed.style.display =
                "flex";

        };


    // =========================
    // TRACK POSITION
    // =========================

    speech.onboundary =
        function (event) {

            if (
                event.name === "word"
            ) {

                currentSpeechPosition +=
                    event.charIndex;

            }

        };


    // =========================
    // SPEECH END
    // =========================

    speech.onend =
        function () {

            isSpeaking =
                false;


            speakingStatus.style.display =
                "none";


            voiceSpeed.style.display =
                "none";


            currentSpeechPosition =
                currentSpeechText.length;

        };


    // =========================
    // SPEECH ERROR
    // =========================

    speech.onerror =
        function () {

            isSpeaking =
                false;


            speakingStatus.style.display =
                "none";


            voiceSpeed.style.display =
                "none";

        };


    // =========================
    // START SPEECH
    // =========================

    window.speechSynthesis.speak(
        speech
    );

}
// =========================
// LOAD SPEECH VOICES
// =========================

let availableVoices = [];

function loadVoices() {

    availableVoices =
        window.speechSynthesis.getVoices();

}

loadVoices();

if ("onvoiceschanged" in speechSynthesis) {

    speechSynthesis.onvoiceschanged =
        loadVoices;

}


// =========================
// CHANGE SPEECH SPEED
// =========================

function changeSpeechSpeed(
    newSpeed
) {

    currentSpeed =
        newSpeed;


    // If AI is not speaking,
    // only save selected speed

    if (!isSpeaking) {

        return;

    }


    // Stop current speech

    window.speechSynthesis.cancel();


    // Restart from current position

    setTimeout(
        function () {

            speakFromPosition();

        },
        50
    );

}


// =========================
// ADD MESSAGE
// =========================

function addMessage(
    message,
    type
) {

    const div =
        document.createElement(
            "div"
        );


    div.classList.add(
        "message",
        type
    );


    if (type === "ai") {

        div.innerHTML =
            marked.parse(
                message
            );

    } else {

        div.textContent =
            message;

    }


    chatBox.appendChild(
        div
    );


    chatBox.scrollTop =
        chatBox.scrollHeight;

}

// =========================
// MOCK INTERVIEW
// =========================

startInterviewBtn.addEventListener(
    "click",
    async function () {

        // =========================
        // ENABLE INTERVIEW MODE
        // =========================

        interviewMode = true;

        // =========================
        // RESET VOICE STATE
        // =========================

        // Stop listening

        if (recognition) {
            try {
                recognition.stop();
            } catch (error) {
                console.log("Recognition already stopped.");
            }
        }


        // Stop AI speaking

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        isSpeaking = false;


        // Hide voice UI

        voiceStatus.style.display = "none";

        speakingStatus.style.display = "none";

        liveTranscript.style.display = "none";

        voiceSpeed.style.display = "none";


        // Clear live transcript

        liveTranscript.textContent =
            "Your speech will appear here...";



        // =========================
        // RESET QUESTION COUNTER
        // =========================

        interviewQuestionCount = 0;

        document.getElementById(
            "questionCounter"
        ).style.display = "block";

        document.getElementById(
            "currentQuestion"
        ).textContent = "1";


        // =========================
        // ENABLE INPUT
        // =========================

        questionInput.disabled = false;
        sendBtn.disabled = false;
        micBtn.disabled = false;


        // =========================
        // RESET OLD SCORECARD
        // =========================

        const interviewEvaluation =
            document.getElementById(
                "interviewEvaluation"
            );

        if (interviewEvaluation) {

            interviewEvaluation.style.display =
                "none";
        }


        // =========================
        // RESET OVERALL SCORE
        // =========================

        document.getElementById(
            "overallScore"
        ).textContent = "0";


        // =========================
        // RESET CATEGORY SCORES
        // =========================

        document.getElementById(
            "technicalScore"
        ).textContent = "0";

        document.getElementById(
            "problemSolvingScore"
        ).textContent = "0";

        document.getElementById(
            "conceptualScore"
        ).textContent = "0";

        document.getElementById(
            "communicationScore"
        ).textContent = "0";


        // =========================
        // RESET PROGRESS BARS
        // =========================

        document.getElementById(
            "technicalProgress"
        ).style.width = "0%";

        document.getElementById(
            "problemSolvingProgress"
        ).style.width = "0%";

        document.getElementById(
            "conceptualProgress"
        ).style.width = "0%";

        document.getElementById(
            "communicationProgress"
        ).style.width = "0%";


        // =========================
        // RESET SCORE CIRCLE
        // =========================

        const scoreCircle =
            document.querySelector(
                ".score-circle"
            );

        if (scoreCircle) {

            scoreCircle.style.background =
                "conic-gradient(" +
                "#222 0deg, " +
                "#222 0deg, " +
                "#e5e7eb 0deg, " +
                "#e5e7eb 360deg)";
        }


        // =========================
        // RESET VERDICT
        // =========================

        document.getElementById(
            "finalVerdict"
        ).textContent =
            "Performance";


        // =========================
        // CLEAR OLD EVALUATION
        // =========================

        document.getElementById(
            "strengthsList"
        ).innerHTML = "";

        document.getElementById(
            "weaknessesList"
        ).innerHTML = "";

        document.getElementById(
            "topicsList"
        ).innerHTML = "";

        document.getElementById(
            "recommendationsList"
        ).innerHTML = "";


        // =========================
        // UPDATE BUTTONS
        // =========================

        startInterviewBtn.style.display =
            "none";

        endInterviewBtn.style.display =
            "inline-block";


        // =========================
        // CLEAR OLD INTERVIEW MEMORY
        // =========================

        try {

            const resetResponse =
                await fetch(
                    "/api/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            resetInterview: true
                        })
                    }
                );


            if (!resetResponse.ok) {

                console.error(
                    "Could not reset interview memory."
                );
            }

        } catch (error) {

            console.error(
                "Could not reset interview memory:",
                error
            );
        }



        // =========================
        // CLEAR OLD CHAT
        // =========================

        chatBox.innerHTML = "";


        // =========================
        // START MESSAGE
        // =========================

        addMessage(
            "🎯 **Mock Interview Started!**\n\n" +
            "I will act as your interviewer. " +
            "Let's begin.",
            "ai"
        );


        // =========================
        // ASK FIRST QUESTION
        // =========================

        try {

            const response =
                await fetch(
                    "/api/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            question:
                                "Please start the interview by asking the first question.",

                            language:
                                "en",

                            interviewMode:
                                true

                        })

                    }
                );


            // =========================
            // READ RESPONSE
            // =========================

            let data;

            try {

                data =
                    await response.json();

            } catch (error) {

                throw new Error(
                    "Invalid response from server."
                );
            }


            // =========================
            // HANDLE ERROR
            // =========================

            if (!response.ok) {

                addMessage(
                    "❌ " +
                    (
                        data.error ||
                        "Unable to start the interview."
                    ),
                    "ai"
                );

                return;
            }


            // =========================
            // CHECK ANSWER
            // =========================

            if (!data.answer) {

                addMessage(
                    "❌ No question was received from AI.",
                    "ai"
                );

                return;
            }


            // =========================
            // ADD FIRST QUESTION
            // =========================

            addMessage(
                data.answer,
                "ai"
            );


            // =========================
            // AI SPEAKS FIRST QUESTION
            // =========================

            speakAnswer(
                data.answer,
                "en"
            );


        } catch (error) {

            console.error(
                "Interview start error:",
                error
            );

            addMessage(
                "❌ Unable to start the mock interview. " +
                "Please try again.",
                "ai"
            );

            // Restore buttons

            interviewMode = false;

            startInterviewBtn.style.display =
                "inline-block";

            endInterviewBtn.style.display =
                "none";

            document.getElementById(
                "questionCounter"
            ).style.display =
                "none";
        }

    }
);


// =========================
// END MOCK INTERVIEW
// =========================

endInterviewBtn.addEventListener(
    "click",
    async function () {

        // =========================
        // STOP AI SPEECH
        // =========================

        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }

        isSpeaking = false;

        speakingStatus.style.display = "none";
        voiceSpeed.style.display = "none";


        // =========================
        // DISABLE INPUT
        // =========================

        questionInput.disabled = true;
        sendBtn.disabled = true;
        micBtn.disabled = true;


        // =========================
        // SHOW EVALUATION MESSAGE
        // =========================

        addMessage(
            "⏹ **Interview ended.**\n\n" +
            "📊 Generating your evaluation...",
            "ai"
        );


        // =========================
        // GENERATE EVALUATION
        // =========================

        const evaluationGenerated =
            await generateInterviewEvaluation();


        // =========================
        // CLEAR INTERVIEW MEMORY
        // =========================

        try {

            const response =
                await fetch(
                    "/api/chat",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            endInterview: true
                        })
                    }
                );


            if (!response.ok) {

                console.error(
                    "Interview memory could not be cleared."
                );
            }

        } catch (error) {

            console.error(
                "Could not clear interview memory:",
                error
            );
        }


        // =========================
        // RESET INTERVIEW MODE
        // =========================

        interviewMode = false;

        startInterviewBtn.style.display =
            "inline-block";

        endInterviewBtn.style.display =
            "none";


        // =========================
        // RESET QUESTION COUNTER
        // =========================

        interviewQuestionCount = 0;

        document.getElementById(
            "currentQuestion"
        ).textContent = "1";


        document.getElementById(
            "questionCounter"
        ).style.display = "none";


        // =========================
        // ENABLE NORMAL CHAT
        // =========================

        questionInput.disabled = false;
        sendBtn.disabled = false;
        micBtn.disabled = false;


        // =========================
        // EVALUATION FAILED
        // =========================

        if (!evaluationGenerated) {

            addMessage(
                "❌ Evaluation could not be generated. " +
                "You can start a new interview and try again.",
                "ai"
            );
        }

    }
);

// =========================
// CLOSE INTERVIEW SCORECARD
// =========================

const closeEvaluationBtn =
    document.getElementById("closeEvaluationBtn");

if (closeEvaluationBtn) {

    closeEvaluationBtn.addEventListener(
        "click",
        function () {

            const interviewEvaluation =
                document.getElementById(
                    "interviewEvaluation"
                );

            if (interviewEvaluation) {

                interviewEvaluation.style.display =
                    "none";
            }

        }
    );
}