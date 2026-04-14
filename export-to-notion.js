// export-to-notion.js

const Q_MAP = {
    // Example structure of Q_MAP
    question1: "What is your name?",
    question2: "How old are you?",
    // Add more questions as necessary
};

const MODS_STRUCT = {
    // Example structure of MODS_STRUCT
    mod1: {
        title: "Module 1",
        description: "Description of module 1",
        questions: ["What is your name?", "How old are you?"],
    },
    // Add more modules as necessary
};

function exportToNotion() {
    const questions = Object.values(Q_MAP).concat(
        ...Object.values(MODS_STRUCT).map(mod => mod.questions)
    );

    // Here you can format the questions for Notion import
    const notionFormat = questions.map(q => ({
        question: q
    }));

    return notionFormat; // This can then be used for importing into Notion
}

console.log(exportToNotion());