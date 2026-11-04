window.cellQuestQuestions = {
  episodes: [
    {
      episode: 2,
      type: "mixed",
      questions: [
        { id: 1, type: "multiple-choice", question: "Which cell structure acts as the control center of the cell?", choices: ["Cell membrane", "Nucleus", "Vacuole", "Cell wall"], correctAnswer: "Nucleus" },
        { id: 2, type: "multiple-choice", question: "Which organelle captures sunlight to produce food through photosynthesis?", choices: ["Mitochondrion", "Nucleus", "Chloroplast", "Vacuole"], correctAnswer: "Chloroplast" },
        { id: 3, type: "multiple-choice", question: "What is the main function of the mitochondrion?", choices: ["To produce energy from food", "To store water and waste", "To control what enters the cell", "To provide a strong outer layer"], correctAnswer: "To produce energy from food" },
        { id: 4, type: "multiple-choice", question: "Which structure controls the movement of substances into and out of the cell?", choices: ["Cell wall", "Chloroplast", "Nucleus", "Cell membrane"], correctAnswer: "Cell membrane" },
        { id: 5, type: "multiple-choice", question: "Which structure stores water, nutrients, and waste and helps keep a plant cell firm?", choices: ["Vacuole", "Mitochondrion", "Nucleus", "Chloroplast"], correctAnswer: "Vacuole" },
        { id: 6, type: "multiple-choice", question: "Which feature distinguishes a typical plant cell from an animal cell?", choices: ["The presence of a nucleus", "The presence of a cell membrane", "The presence of a cell wall and chloroplasts", "The presence of mitochondria"], correctAnswer: "The presence of a cell wall and chloroplasts" },
        { id: 7, type: "true-false", question: "The cell wall provides support and protection to plant cells.", correctAnswer: true },
        { id: 8, type: "true-false", question: "The nucleus produces the energy needed by the cell.", correctAnswer: false },
        { id: 9, type: "true-false", question: "Chloroplasts use sunlight to help plants make food through photosynthesis.", correctAnswer: true },
        { id: 10, type: "true-false", question: "Animal cells have chloroplasts that allow them to make their own food through photosynthesis.", correctAnswer: false }
      ]
    },
    {
      episode: 4,
      type: "multiple-choice",
      questions: [
        ["Which organelle controls the activities of the cell and contains its DNA?", ["Lysosome", "Nucleus", "Golgi apparatus", "Cytoplasm"], "Nucleus"],
        ["Which organelle produces ATP to provide energy for cellular activities?", ["Mitochondrion", "Ribosome", "Vacuole", "Cell membrane"], "Mitochondrion"],
        ["What is the main function of the cell membrane?", ["To produce proteins", "To store genetic information", "To control what enters and leaves the cell", "To break down worn-out organelles"], "To control what enters and leaves the cell"],
        ["Which cell structure provides space for organelles and allows many chemical reactions to occur?", ["Nucleus", "Cytoplasm", "Golgi apparatus", "Lysosome"], "Cytoplasm"],
        ["What is the main function of the Golgi apparatus?", ["To sort, package, and deliver proteins and other materials", "To produce energy for the cell", "To control the cell's activities", "To make lipids and remove harmful substances"], "To sort, package, and deliver proteins and other materials"],
        ["Which organelle builds proteins needed for cell growth and repair?", ["Lysosome", "Ribosome", "Mitochondrion", "Vacuole"], "Ribosome"],
        ["What is the main function of the rough endoplasmic reticulum?", ["To store water and nutrients", "To digest cellular waste", "To help transport proteins made by ribosomes", "To produce ATP"], "To help transport proteins made by ribosomes"],
        ["Which organelle produces lipids and helps remove harmful substances?", ["Smooth endoplasmic reticulum", "Golgi apparatus", "Nucleus", "Ribosome"], "Smooth endoplasmic reticulum"],
        ["What happens when the organelles work together properly?", ["The cell stops performing its functions.", "The cell loses its genetic information.", "The cell can function and remain healthy.", "The cell no longer needs energy."], "The cell can function and remain healthy."],
        ["Which organelle breaks down waste, worn-out organelles, and unwanted materials?", ["Vacuole", "Lysosome", "Cell membrane", "Mitochondrion"], "Lysosome"]
      ].map((q, i) => ({ id: i + 1, question: q[0], choices: q[1], correctAnswer: q[2] }))
    },
    {
      episode: 6,
      type: "mixed",
      questions: [
        ["What unique structure gives plant cells extra support and protection, allowing plants to stand upright?", ["Cell membrane", "Cell wall", "Chloroplast", "Nucleus"], "Cell wall"],
        ["Which organelle is responsible for using sunlight to make food (sugar) through photosynthesis in plant cells?", ["Mitochondria", "Vacuole", "Chloroplasts", "Ribosome"], "Chloroplasts"],
        ["Why do animal cells not have chloroplasts?", ["They are too small to fit chloroplasts inside them.", "Animals get their food by eating instead of making it themselves.", "Animal cells get all their energy directly from the wind.", "Animal cells use their cell walls to make food instead."], "Animals get their food by eating instead of making it themselves."],
        ["How do plant vacuoles differ from animal vacuoles?", ["Plant cells have one large central vacuole, while animal cells have several small vacuoles.", "Animal cells have one giant vacuole, while plant cells have none.", "Plant vacuoles store proteins only, while animal vacuoles store sunlight.", "There is no difference between them."], "Plant cells have one large central vacuole, while animal cells have several small vacuoles."],
        ["Why are both plant and animal cells classified as eukaryotic cells?", ["Because they both lack a nucleus.", "Because they both have a true nucleus and membrane-bound organelles.", "Because they both have cell walls and chloroplasts.", "Because they both can move around freely to chase food."], "Because they both have a true nucleus and membrane-bound organelles."]
      ].map((q, i) => ({ id: i + 1, type: "multiple-choice", question: q[0], choices: q[1], correctAnswer: q[2] })).concat([
        { id: 6, type: "matching", question: "Cell Membrane", correctAnswer: "B", answer: "Regulates what enters and leaves the cell, keeping harmful substances out like a security guard." },
        { id: 7, type: "matching", question: "Mitochondria", correctAnswer: "C", answer: "Produces energy (\"Energize!\") for both plant and animal cells." },
        { id: 8, type: "matching", question: "Nucleus", correctAnswer: "A", answer: "Controls the cell and gives out genetic instructions for both cell types." },
        { id: 9, type: "matching", question: "Flora (Plant Cell)", correctAnswer: "E", answer: "Has a cell wall, chloroplasts, and one large central vacuole for water storage." },
        { id: 10, type: "matching", question: "Andy (Animal Cell)", correctAnswer: "D", answer: "Has a flexible shape, no cell wall, no chloroplasts, and small vacuoles." }
      ])
    },
    {
      episode: 8,
      type: "true-false",
      questions: [
        ["The cell membrane acts as a security gate that decides what enters and leaves the cell, letting helpful materials in and blocking harmful substances.", true],
        ["Diffusion is the movement of molecules from an area of low concentration to an area of high concentration.", false],
        ["Diffusion occurs naturally and does not require energy (ATP).", true],
        ["Equilibrium is reached during diffusion when molecules are evenly distributed across a space.", true],
        ["Osmosis is the movement of any molecule across a selectively permeable membrane.", false],
        ["Active transport requires energy (ATP) because materials are being moved against the concentration gradient.", true],
        ["Plant cells release carbon dioxide into the air during photosynthesis to help humans breathe.", false],
        ["Plant cells are used to produce everyday items such as paper, wood, clothing fibers like cotton, and some medicines.", true],
        ["Scientists study animal cells to help understand diseases, develop vaccines, and test new medical treatments.", true],
        ["Animal cells are responsible for building muscles, bones, skin, blood, and organs in the human body.", true]
      ].map((q, i) => ({ id: i + 1, question: q[0], correctAnswer: q[1] }))
    }
  ]
};
