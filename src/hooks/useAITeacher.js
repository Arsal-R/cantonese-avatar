const { create } = require("zustand");

export const teachers = ["Nanami", "Naoki"];

// Helper function to wrap a fetch call with a timeout
const fetchWithTimeout = (resource, options, timeout = 13000) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Request timed out')), timeout);
        fetch(resource, options)
            .then(response => response.ok ? resolve(response) : reject(new Error('Failed to fetch')))
            .catch(reject)
            .finally(() => clearTimeout(timeoutId));
    });
};

export const useAITeacher = create((set, get) => ({
    messages: [],
    currentMessage: null,
    teacher: teachers[0],
    setTeacher: (teacher) => {
        set(() => ({
            teacher,
            messages: get().messages.map((message) => {
                message.audioPlayer = null;
                return message;
            }),
        }));
    },
    classroom: "default",
    setClassroom: (classroom) => {
        set(() => ({
            classroom,
        }));
    },
    loading: false,
    cantonese: false,
    setCantonese: (cantonese) => {
        set(() => ({
            cantonese,
        }));
    },
    english: true,
    setEnglish: (english) => {
        set(() => ({
            english,
        }));
    },
    speech: "answer",
    setSpeech: (speech) => {
        set(() => ({
            speech,
        }));
    },
    STT: async (audioblob) => {
        console.log("Received audio blob")
        console.log(audioblob)

        const formData = new FormData();
        formData.append("audio", audioblob, "audio_file.ogg");

        const audi_res = await fetch("/api/stt", {
            method: 'POST',
            body: formData
        });
        const data = audi_res.json();
        console.log("Data is ")
        console.log(data)
    },
    askAI: async (question, cantonese, prompt) => {
        if (!question) return;

        const message = {
            question,
            id: get().messages.length,
        };
        set(() => ({ loading: true }));

        const speech = get().speech;
        const url = `/api/ai?question=${encodeURIComponent(question)}&speech=${encodeURIComponent(speech)}&prompt=${encodeURIComponent(prompt)}`;

        try {
            const data = await fetchWithTimeout(url, {}).then((res) => res.json());
            console.log('Data is :', data.answer);
            message.answer = data.answer;
        } catch (error) {
            console.error('Error fetching data:', error);
            // Attempt to retry once after 13 seconds
            try {
                const data = await fetchWithTimeout(url, {}).then((res) => res.json());
                console.log('Data is :', data.answer);
                message.answer = data.answer;
            } catch (retryError) {
                console.error('Error on retry:', retryError);
                // Use a template answer after retry fails
                message.answer = "Sorry, there was a server error.";
            }
        }

        message.speech = speech;
        set(() => ({ currentMessage: message }));
        set((state) => ({
            messages: [...state.messages, message],
            loading: false,
        }));
        console.log(message);
        get().playMessage(message, cantonese);
    },
    playMessage: async (message, cantonese) => {
        set(() => ({
            currentMessage: message,
        }));

        if (!message.audioPlayer) {
            set(() => ({
                loading: true,
            }));
            console.log(message);

            const audioRes = await fetch(`/api/tts?text=${message.answer}&language=${cantonese ? "cantonese" : "english"}`);
            const audio = await audioRes.blob();
            // console.log(audioRes.headers.get("visemes"))

            const visemes = JSON.parse(await audioRes.headers.get("visemes"));
            const audioUrl = URL.createObjectURL(audio);
            const audioPlayer = new Audio(audioUrl);

            message.visemes = visemes;
            message.audioPlayer = audioPlayer;
            message.audioPlayer.onended = () => {
                set(() => ({
                    currentMessage: null,
                }));
            };
            set(() => ({
                loading: false,
                messages: get().messages.map((m) => {
                    if (m.id === message.id) {
                        return message;
                    }
                    return m;
                }),
            }));
        }

        message.audioPlayer.currentTime = 0;
        message.audioPlayer.play();
    },
    stopMessage: (message) => {
        message.audioPlayer.pause();
        set(() => ({
            currentMessage: null,
        }));
    },
}));
