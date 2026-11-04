(function () {
    "use strict";

    const app = window.comicApp;

    if (!app) {
        console.error("Cell Quest configuration is missing.");
        return;
    }

    const episodes = app.comic.episodes;
    const QUESTION_COUNT = 10;
    const STORAGE_KEY = "cell-quest-quiz-progress-v1";
    const URL_PROGRESS_KEY = "cqProgress";

    const $ = (id) => document.getElementById(id);

    let memoryProgress = {
        completed: [],
        scores: {}
    };

    // ==========================================
    // OFFLINE STORAGE
    // ==========================================

    function canUseStorage() {
        try {
            const key = "cell-quest-storage-test";

            localStorage.setItem(key, "test");
            localStorage.removeItem(key);

            return true;
        } catch (error) {
            return false;
        }
    }

    const storageAvailable = canUseStorage();

    function emptyProgress() {
        return {
            completed: [],
            scores: {}
        };
    }

    function normalizeProgress(data) {
        const result = emptyProgress();

        if (!data || !Array.isArray(data.completed)) {
            return result;
        }

        // Only even-numbered episodes are quiz checkpoints.
        for (const number of [2, 4, 6, 8]) {
            if (data.completed.includes(number)) {
                result.completed.push(number);
            } else {
                break;
            }
        }

        if (data.scores && typeof data.scores === "object") {
            result.completed.forEach(function (number) {
                const score = data.scores[number];

                if (
                    Number.isInteger(score) &&
                    score >= 0 &&
                    score <= QUESTION_COUNT
                ) {
                    result.scores[number] = score;
                }
            });
        }

        return result;
    }

    function parseProgress(raw) {
        if (!raw) {
            return emptyProgress();
        }

        try {
            return normalizeProgress(JSON.parse(raw));
        } catch (error) {
            return emptyProgress();
        }
    }

    function readProgress() {
        let best = memoryProgress;

        if (storageAvailable) {
            try {
                const stored = parseProgress(
                    localStorage.getItem(STORAGE_KEY)
                );

                if (
                    stored.completed.length >
                    best.completed.length
                ) {
                    best = stored;
                }
            } catch (error) {
                console.warn("Unable to read local progress.", error);
            }
        }

        // URL fallback for browsers that restrict file:// storage.
        const urlProgress = parseProgress(
            new URLSearchParams(
                window.location.search
            ).get(URL_PROGRESS_KEY)
        );

        if (
            urlProgress.completed.length >
            best.completed.length
        ) {
            best = urlProgress;
        }

        memoryProgress = normalizeProgress(best);

        return memoryProgress;
    }

    function updateCurrentProgressUrl() {
        try {
            const url = new URL(window.location.href);

            url.searchParams.set(
                URL_PROGRESS_KEY,
                JSON.stringify(memoryProgress)
            );

            window.history.replaceState(null, "", url.href);
        } catch (error) {
            console.warn("Could not update progress URL.", error);
        }
    }

    function saveProgress(progress) {
        memoryProgress = normalizeProgress(progress);

        let persisted = false;

        if (storageAvailable) {
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(memoryProgress)
                );

                persisted = true;
            } catch (error) {
                console.warn("Unable to save local progress.", error);
            }
        }

        updateCurrentProgressUrl();

        return persisted;
    }

    function resetProgress() {
        memoryProgress = emptyProgress();

        if (storageAvailable) {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (error) {
                console.warn("Unable to clear local progress.", error);
            }
        }

        try {
            const url = new URL(window.location.href);
            url.searchParams.delete(URL_PROGRESS_KEY);
            window.history.replaceState(null, "", url.href);
        } catch (error) {
            console.warn("Could not clear progress from the URL.", error);
        }
    }

    function setupResetControl() {
        const resetButton = $("resetProgress");

        if (!resetButton) {
            return;
        }

        resetButton.addEventListener("click", function () {
            if (!window.confirm("Reset your Cell Quest journey? All episodes will be locked again.")) {
                return;
            }

            resetProgress();
            renderLanding();
            window.location.hash = "episodes";
        });
    }

    function withProgress(href) {
        const parts = href.split("#");
        const beforeHash = parts[0];

        const hash = parts.length > 1
            ? "#" + parts.slice(1).join("#")
            : "";

        const queryIndex = beforeHash.indexOf("?");

        const path = queryIndex === -1
            ? beforeHash
            : beforeHash.slice(0, queryIndex);

        const query = queryIndex === -1
            ? ""
            : beforeHash.slice(queryIndex + 1);

        const params = new URLSearchParams(query);

        params.set(
            URL_PROGRESS_KEY,
            JSON.stringify(readProgress())
        );

        return `${path}?${params.toString()}${hash}`;


    }

    function completedCount() {
        return readProgress().completed.length;
    }

    function isCompleted(number) {
        return readProgress().completed.includes(number);
    }

    function isUnlocked(number) {
        const completed = readProgress().completed;
        const lastCheckpoint = completed.length
            ? completed[completed.length - 1]
            : 0;

        return number <= lastCheckpoint + 2;
    }

    function completeEpisode(number, score) {
        const progress = readProgress();

        if (!isUnlocked(number) || number % 2 !== 0) {
            return false;
        }

        if (!progress.completed.includes(number)) {
            progress.completed.push(number);
        }

        progress.scores[number] = score;

        return saveProgress(progress);
    }

    function showStorageWarning() {
        const warning = $("storageWarning");

        if (!warning || storageAvailable) {
            return;
        }

        warning.hidden = false;

        warning.textContent =
            "Your browser restricts storage for local files. " +
            "Cell Quest will carry progress through its navigation links, " +
            "but reopening the original index.html may start a new session.";
    }

    // ==========================================
    // HOMEPAGE
    // ==========================================

    function renderLanding() {
        const grid = $("episodeGrid");
        const label = $("progressLabel");
        const progressFill = $("progressFill");

        if (!grid || !label) {
            return;
        }

        const progress = readProgress();

        label.textContent =
            `${progress.completed.length} of ${episodes.length / 2} assessments completed`;

        if (progressFill) {
            progressFill.style.width =
                `${progress.completed.length / (episodes.length / 2) * 100}%`;
        }

        grid.replaceChildren();

        episodes.forEach(function (episode) {
            const completed = isCompleted(episode.number);
            const unlocked = isUnlocked(episode.number);

            const li = document.createElement("li");
            const card = document.createElement(
                unlocked ? "a" : "div"
            );

            card.className = "episode-card";

            if (completed) {
                card.classList.add("is-completed");
            } else if (unlocked) {
                card.classList.add("is-available");
            } else {
                card.classList.add("is-locked");

                card.setAttribute(
                    "aria-label",
                    `${episode.title} is locked`
                );
            }

            if (unlocked) {
                card.href = withProgress(
                    `comics/reader.html?episode=${episode.number}`
                );
            }

            const number = document.createElement("span");
            number.className = "episode-number";
            number.textContent =
                String(episode.number).padStart(2, "0");

            const copy = document.createElement("span");
            copy.className = "episode-card-copy";

            const title = document.createElement("strong");
            title.textContent = episode.title;

            const description = document.createElement("small");

            if (completed) {
                const score = progress.scores[episode.number];

                description.textContent =
                    Number.isInteger(score)
                        ? `Completed • Score ${score}/10`
                        : "Completed";
            } else if (unlocked) {
                description.textContent =
                    `${episode.pageCount} pages • Ready to read`;
            } else {
                description.textContent =
                    "Locked • Complete previous episode";
            }

            const arrow = document.createElement("span");
            arrow.className = "episode-arrow";
            arrow.setAttribute("aria-hidden", "true");

            arrow.textContent = completed
                ? "✓"
                : unlocked
                    ? "→"
                    : "🔒";

            copy.append(title, description);
            card.append(number, copy, arrow);
            li.appendChild(card);
            grid.appendChild(li);
        });

        showStorageWarning();
    }

    // ==========================================
    // READER NAVIGATION
    // ==========================================

    function setNavigationLink(element, href, text) {
        element.textContent = text;
        element.classList.remove("is-disabled");

        if (href) {
            element.href = withProgress(href);
            element.removeAttribute("aria-disabled");
        } else {
            element.removeAttribute("href");
            element.classList.add("is-disabled");
            element.setAttribute("aria-disabled", "true");
        }
    }

    function updateHomeLinks() {
        document.querySelectorAll(
            '.reader-page a[data-home-link]'
        ).forEach(function (link) {
            const original = link.dataset.homeLink;

            link.href = withProgress(original);
        });
    }

    function renderEpisodeNavigation(currentEpisode) {
        const nav = $("episodeNav");

        nav.replaceChildren();

        episodes.forEach(function (episode) {
            const unlocked = isUnlocked(episode.number);
            const completed = isCompleted(episode.number);

            const li = document.createElement("li");

            const item = document.createElement(
                unlocked ? "a" : "span"
            );

            if (unlocked) {
                item.href = withProgress(
                    `reader.html?episode=${episode.number}`
                );

                if (completed) {
                    item.classList.add("is-completed");
                }

                if (episode.number === currentEpisode.number) {
                    item.classList.add("is-active");
                    item.setAttribute("aria-current", "page");
                }
            } else {
                item.classList.add("episode-nav-locked");
                item.setAttribute(
                    "aria-label",
                    `${episode.title} locked`
                );
            }

            const number = document.createElement("span");
            number.textContent =
                String(episode.number).padStart(2, "0");

            const text = document.createTextNode(
                episode.title +
                (completed ? " ✓" : unlocked ? "" : " 🔒")
            );

            item.append(number, text);
            li.appendChild(item);
            nav.appendChild(li);
        });
    }

    function updateEpisodeControls(episode, index) {
        const previous = episodes[index - 1];
        const next = episodes[index + 1];

        setNavigationLink(
            $("previousEpisode"),
            previous
                ? `reader.html?episode=${previous.number}`
                : null,
            "← Previous Episode"
        );

        // Odd episodes do not have an assessment; readers can continue to
        // the next episode in the current pair without submitting a quiz.
        if (episode.number % 2 !== 0) {
            setNavigationLink(
                $("nextEpisode"),
                next ? `reader.html?episode=${next.number}` : null,
                next ? "Next Episode →" : "Return to Episodes"
            );

            return;
        }

        if (!isCompleted(episode.number)) {
            setNavigationLink(
                $("nextEpisode"),
                null,
                "Complete Quiz to Continue →"
            );

            return;
        }

        if (next) {
            setNavigationLink(
                $("nextEpisode"),
                `reader.html?episode=${next.number}`,
                "Next Episode →"
            );
        } else {
            setNavigationLink(
                $("nextEpisode"),
                "../index.html#episodes",
                "Finish Adventure ✓"
            );
        }
    }

    // ==========================================
    // COMIC IMAGE RENDERING
    // ==========================================

    function addComicPage(container, src, alt, eager = false) {
        const figure = document.createElement("figure");
        figure.className = "comic-page";

        const image = document.createElement("img");
        image.src = src;
        image.alt = alt;
        image.loading = eager ? "eager" : "lazy";
        image.decoding = "async";

        figure.appendChild(image);
        container.appendChild(figure);

        return figure;
    }

    function renderComic(episode) {
        const container = $("comicPages");

        container.replaceChildren();

        if (episode.number === 1) {
            app.comic.titlePages.forEach(function (file, index) {
                const figure = addComicPage(
                    container,
                    app.titlePagePath(file),
                    `${app.comic.title} title page ${index + 1}`,
                    index === 0
                );

                figure.classList.add("title-page");
            });
        }

        for (let page = 1; page <= episode.pageCount; page++) {
            addComicPage(
                container,
                app.episodePagePath(episode, page),
                `${episode.title}, page ${page}`,
                page === 1
            );
        }
    }

    // ==========================================
    // QUIZ VALIDATION
    // ==========================================

    function validateQuiz(episodeNumber) {
        const bank = window.cellQuestQuestions;

        if (!bank || !Array.isArray(bank.episodes)) {
            throw new Error(
                "The questions.js file is missing or invalid."
            );
        }

        if (episodeNumber % 2 !== 0) {
            throw new Error(
                `The assessment is available after Episode ${episodeNumber + 1}.`
            );
        }

        const quiz = bank.episodes.find((entry) => entry.episode === episodeNumber);

        if (!quiz) {
            throw new Error(`No questions found for Episodes ${episodeNumber - 1}-${episodeNumber}.`);
        }

        const allowedTypes = [
            "multiple-choice",
            "true-false",
            "matching",
            "mixed"
        ];

        if (!allowedTypes.includes(quiz.type)) {
            throw new Error(
                `Episode ${episodeNumber} has an invalid quiz type.`
            );
        }

        if (
            !Array.isArray(quiz.questions) ||
            quiz.questions.length !== QUESTION_COUNT
        ) {
            throw new Error(
                `Episode ${episodeNumber} must contain exactly 10 questions.`
            );
        }

        const questionIds = new Set();
        const matchingAnswers = new Set();

        quiz.questions.forEach(function (question, index) {
            const id = String(question.id);

            if (
                question.id === undefined ||
                question.id === null ||
                questionIds.has(id)
            ) {
                throw new Error(
                    `Question ${index + 1} has an invalid or duplicate ID.`
                );
            }

            questionIds.add(id);

            if (
                typeof question.question !== "string" ||
                !question.question.trim()
            ) {
                throw new Error(
                    `Question ${index + 1} has no question text.`
                );
            }

            if (quiz.type === "multiple-choice") {
                if (
                    !Array.isArray(question.choices) ||
                    question.choices.length < 2 ||
                    !question.choices.every(
                        (choice) =>
                            typeof choice === "string" &&
                            choice.trim()
                    ) ||
                    new Set(question.choices).size !==
                    question.choices.length ||
                    !question.choices.includes(
                        question.correctAnswer
                    )
                ) {
                    throw new Error(
                        `Question ${index + 1} has invalid choices or correctAnswer.`
                    );
                }
            }

            if (quiz.type === "true-false") {
                if (typeof question.correctAnswer !== "boolean") {
                    throw new Error(
                        `Question ${index + 1} must use true or false.`
                    );
                }
            }

            if (quiz.type === "matching") {
                if (
                    typeof question.correctAnswer !== "string" ||
                    !question.correctAnswer.trim() ||
                    matchingAnswers.has(question.correctAnswer)
                ) {
                    throw new Error(
                        `Matching question ${index + 1} needs a unique correctAnswer.`
                    );
                }

                matchingAnswers.add(question.correctAnswer);
            }
        });

        return quiz;
    }

    // ==========================================
    // QUIZ STATUS
    // ==========================================

    function setQuizStatus(message, type = "normal") {
        const status = $("quizStatus");

        status.textContent = message;

        status.classList.toggle(
            "is-error",
            type === "error"
        );

        status.classList.toggle(
            "is-success",
            type === "success"
        );
    }

    // ==========================================
    // MCQ AND TRUE/FALSE
    // ==========================================

    function createChoiceQuestion(question, index, type) {
        const fieldset = document.createElement("fieldset");
        fieldset.className = "quiz-question";

        const legend = document.createElement("legend");

        legend.textContent =
            `${index + 1}. ${question.question}`;

        const options = document.createElement("div");
        options.className = "quiz-options";

        const choices = type === "true-false"
            ? ["True", "False"]
            : question.choices;

        choices.forEach(function (choice) {
            const label = document.createElement("label");
            label.className = "quiz-choice";

            const radio = document.createElement("input");

            radio.type = "radio";
            radio.name = `quiz-question-${index}`;
            radio.value = choice;

            const text = document.createElement("span");
            text.textContent = choice;

            label.append(radio, text);
            options.appendChild(label);
        });

        fieldset.append(legend, options);

        return fieldset;
    }

    // ==========================================
    // MATCHING TYPE UTILITIES
    // ==========================================

    function shuffle(items) {
        const result = [...items];

        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [result[i], result[j]] =
                [result[j], result[i]];
        }

        return result;
    }

    function makeMatchButton(marker, content) {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "match-button";

        const markerElement = document.createElement("span");
        markerElement.className = "match-marker";
        markerElement.textContent = marker;

        const contentElement = document.createElement("span");
        contentElement.className = "match-content";
        contentElement.textContent = content;

        const label = document.createElement("span");
        label.className = "match-label";
        label.textContent = "Select";

        button.append(
            markerElement,
            contentElement,
            label
        );

        return { button, label };
    }

    // ==========================================
    // INTERACTIVE MATCHING QUIZ
    // ==========================================

    function renderMatchingQuiz(quiz, container) {
        const assignments = new Map();

        const leftButtons = new Map();
        const rightButtons = new Map();

        let selectedLeft = null;

        const instructions = document.createElement("p");
        instructions.className = "match-instructions";

        const board = document.createElement("div");
        board.className = "matching-board";

        const leftColumn = document.createElement("div");
        leftColumn.className = "match-column";

        const rightColumn = document.createElement("div");
        rightColumn.className = "match-column";

        const leftHeading = document.createElement("h3");
        leftHeading.textContent = "Statements";

        const rightHeading = document.createElement("h3");
        rightHeading.textContent = "Answers";

        leftColumn.appendChild(leftHeading);
        rightColumn.appendChild(rightHeading);

        // LEFT SIDE: QUESTIONS
        quiz.questions.forEach(function (question, index) {
            const id = String(question.id);

            const record = makeMatchButton(
                String(index + 1),
                question.question
            );

            record.number = index + 1;

            record.button.addEventListener("click", function () {
                selectedLeft = selectedLeft === id
                    ? null
                    : id;

                refreshMatches();
            });

            leftButtons.set(id, record);

            leftColumn.appendChild(record.button);
        });

        // RIGHT SIDE: SHUFFLED ANSWERS
        const shuffled = [...quiz.questions].sort(function (a, b) {
            return a.correctAnswer.localeCompare(b.correctAnswer);
        });

        shuffled.forEach(function (question) {
            const id = String(question.id);
            // Preserve the source answer-key label (A-E) even when the
            // answer cards are shuffled visually.
            const letter = question.correctAnswer;

            const record = makeMatchButton(
                letter,
                question.answer || question.correctAnswer
            );

            record.letter = letter;

            record.button.addEventListener("click", function () {
                if (selectedLeft === null) {
                    instructions.textContent =
                        "Please select a statement on the left first.";

                    return;
                }

                // Remove any old connection using this answer.
                for (const [leftId, rightId] of assignments) {
                    if (rightId === id) {
                        assignments.delete(leftId);
                    }
                }

                assignments.set(selectedLeft, id);

                selectedLeft = null;

                refreshMatches();
            });

            rightButtons.set(id, record);

            rightColumn.appendChild(record.button);
        });

        // SVG CONNECTION LINES
        const svgNS = "http://www.w3.org/2000/svg";

        const svg = document.createElementNS(
            svgNS,
            "svg"
        );

        svg.classList.add("match-lines");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");

        board.append(
            leftColumn,
            rightColumn,
            svg
        );

        container.append(
            instructions,
            board
        );

        function drawLines() {
            const boardRect = board.getBoundingClientRect();

            if (!boardRect.width || !boardRect.height) {
                return;
            }

            svg.setAttribute(
                "viewBox",
                `0 0 ${boardRect.width} ${boardRect.height}`
            );

            svg.replaceChildren();

            assignments.forEach(function (rightId, leftId) {
                const leftRecord = leftButtons.get(leftId);
                const rightRecord = rightButtons.get(rightId);

                if (!leftRecord || !rightRecord) {
                    return;
                }

                const leftRect =
                    leftRecord.button.getBoundingClientRect();

                const rightRect =
                    rightRecord.button.getBoundingClientRect();

                const line = document.createElementNS(
                    svgNS,
                    "line"
                );

                line.setAttribute(
                    "x1",
                    leftRect.right - boardRect.left
                );

                line.setAttribute(
                    "y1",
                    leftRect.top +
                    leftRect.height / 2 -
                    boardRect.top
                );

                line.setAttribute(
                    "x2",
                    rightRect.left - boardRect.left
                );

                line.setAttribute(
                    "y2",
                    rightRect.top +
                    rightRect.height / 2 -
                    boardRect.top
                );

                svg.appendChild(line);
            });
        }

        function refreshMatches() {
            const reverse = new Map();

            assignments.forEach(function (rightId, leftId) {
                reverse.set(rightId, leftId);
            });

            leftButtons.forEach(function (record, id) {
                const assigned = assignments.get(id);
                const paired = assigned !== undefined;

                record.button.classList.toggle(
                    "is-paired",
                    paired
                );

                record.button.classList.toggle(
                    "is-selected",
                    selectedLeft === id
                );

                record.button.setAttribute(
                    "aria-pressed",
                    String(selectedLeft === id)
                );

                if (selectedLeft === id) {
                    record.label.textContent =
                        "Select an answer →";
                } else if (paired) {
                    record.label.textContent =
                        `→ ${rightButtons.get(assigned).letter}`;
                } else {
                    record.label.textContent = "Select";
                }
            });

            rightButtons.forEach(function (record, id) {
                const pairedTo = reverse.get(id);
                const paired = pairedTo !== undefined;

                record.button.classList.toggle(
                    "is-paired",
                    paired
                );

                record.label.textContent = paired
                    ? `← ${leftButtons.get(pairedTo).number}`
                    : "Available";
            });

            instructions.textContent =
                "Click a statement on the left, then its answer " +
                `on the right. ${assignments.size}/${quiz.questions.length} pairs matched.`;

            window.requestAnimationFrame(drawLines);
        }

        if ("ResizeObserver" in window) {
            const observer = new ResizeObserver(drawLines);
            observer.observe(board);
        } else {
            window.addEventListener("resize", drawLines);
        }

        refreshMatches();

        return assignments;
    }

    // ==========================================
    // ANSWER COLLECTION AND GRADING
    // ==========================================

    function collectAnswers(quiz, matchingAnswers) {
        let answered = 0;
        let score = 0;

        if (quiz.type === "matching") {
            answered = matchingAnswers.size;

            quiz.questions.forEach(function (question) {
                const id = String(question.id);

                if (matchingAnswers.has(id) && matchingAnswers.get(id) === id) {
                    score++;
                }
            });

            return { answered, score };
        }

        if (quiz.type === "mixed" && matchingAnswers) {
            answered = matchingAnswers.size;

            quiz.questions
                .filter((question) => (question.type || quiz.type) === "matching")
                .forEach(function (question) {
                    const id = String(question.id);

                    if (matchingAnswers.has(id) && matchingAnswers.get(id) === id) {
                        score++;
                    }
                });
        }

        quiz.questions.forEach(function (question, index) {
            const selected = document.querySelector(
                `input[name="quiz-question-${index}"]:checked`
            );

            if (!selected) {
                return;
            }

            answered++;

            const questionType = question.type || quiz.type;

            if (questionType === "multiple-choice") {
                if (selected.value === question.correctAnswer) {
                    score++;
                }
            }

            if (questionType === "true-false") {
                const value = selected.value === "True";

                if (value === question.correctAnswer) {
                    score++;
                }
            }
        });

        return { answered, score };
    }

    // ==========================================
    // QUIZ RENDERING
    // ==========================================

    function renderQuiz(quiz, episode, episodeIndex) {
        const form = $("quizForm");
        const container = $("quizContainer");
        const result = $("quizResult");

        form.hidden = false;

        container.replaceChildren();
        result.textContent = "";
        result.classList.remove("is-error");

        $("quizTitle").textContent =
            `Episodes ${episode.number - 1}-${episode.number} Assessment`;

        const typeNames = {
            "multiple-choice": "Multiple Choice",
            "true-false": "True or False",
            "matching": "Matching Type",
            "mixed": "Multiple Choice and Matching"
        };

        $("quizType").textContent =
            `${typeNames[quiz.type]} • 10 Questions`;

        let matchingAnswers = null;

        if (quiz.type === "matching") {
            matchingAnswers = renderMatchingQuiz(
                quiz,
                container
            );
        } else if (quiz.type === "mixed") {
            const choiceQuestions = quiz.questions.filter(
                (question) => question.type !== "matching"
            );
            const matchingQuestions = quiz.questions.filter(
                (question) => question.type === "matching"
            );

            choiceQuestions.forEach(function (question, index) {
                container.appendChild(
                    createChoiceQuestion(
                        question,
                        quiz.questions.indexOf(question),
                        question.type
                    )
                );
            });

            matchingAnswers = renderMatchingQuiz(
                { questions: matchingQuestions },
                container
            );
        } else {
            quiz.questions.forEach(function (question, index) {
                container.appendChild(
                    createChoiceQuestion(
                        question,
                        index,
                        question.type || quiz.type
                    )
                );
            });
        }

        function updateAnswerCount() {
            const grading = collectAnswers(
                quiz,
                matchingAnswers
            );

        if (episode.number % 2 !== 0) {
            setNavigationLink(
                $("nextEpisode"),
                next ? `reader.html?episode=${next.number}` : null,
                next ? "Next Episode →" : "Return to Episodes"
            );

            return;
        }

        if (!isCompleted(episode.number)) {
                setQuizStatus(
                    `${grading.answered}/10 answers completed. ` +
                    "Answer all questions to continue."
                );
            }
        }

        form.addEventListener("change", updateAnswerCount);

        if (isCompleted(episode.number)) {
            setQuizStatus(
                "You have already completed this episode. " +
                "You may retake the quiz to update your score.",
                "success"
            );
        } else {
            updateAnswerCount();
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const grading = collectAnswers(
                quiz,
                matchingAnswers
            );

            if (grading.answered < QUESTION_COUNT) {
                const remaining =
                    QUESTION_COUNT - grading.answered;

                setQuizStatus(
                    `Please answer the remaining ${remaining} ` +
                    `question${remaining === 1 ? "" : "s"}.`,
                    "error"
                );

                result.textContent =
                    `Incomplete: ${grading.answered}/10 answered.`;

                result.classList.add("is-error");

                $("quizStatus").scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                return;
            }

            const persisted = completeEpisode(
                episode.number,
                grading.score
            );

            setQuizStatus(
                "All 10 questions have been submitted.",
                "success"
            );

            result.classList.remove("is-error");

            let message =
                `Quiz completed! Your score is ${grading.score}/10. `;

            if (episodeIndex < episodes.length - 1) {
                message +=
                    `Episodes ${episode.number + 1} and ${episode.number + 2} are now unlocked.`;
            } else {
                message +=
                    "Congratulations! You completed Cell Quest.";
            }

            if (!persisted) {
                message +=
                    " Your progress is carried in navigation links " +
                    "because persistent browser storage is unavailable.";
            }

            result.textContent = message;

            renderEpisodeNavigation(episode);

            updateEpisodeControls(
                episode,
                episodeIndex
            );

            updateHomeLinks();
        });
    }

    // ==========================================
    // LOAD LOCAL QUESTION BANK
    // ==========================================

    function loadQuiz(episode, episodeIndex) {
        if (episode.number % 2 !== 0) {
            $("quizForm").hidden = true;
            $("quizTitle").textContent = `Episodes ${episode.number}-${episode.number + 1} Assessment`;
            $("quizType").textContent = "Available after the pair";
            setQuizStatus(
                `Read Episode ${episode.number + 1} to unlock the combined assessment.`,
                "success"
            );
            return;
        }

        try {
            const quiz = validateQuiz(episode.number);

            renderQuiz(
                quiz,
                episode,
                episodeIndex
            );
        } catch (error) {
            console.error("Cell Quest quiz error:", error);

            setQuizStatus(
                error.message,
                "error"
            );

            $("quizForm").hidden = true;
        }
    }

    // ==========================================
    // READER FOCUS MODE
    // ==========================================

    function setupReaderControls() {
        const header = $("readerHeader");
        const toggle = $("readerModeToggle");

        let previousY = window.scrollY;

        window.addEventListener(
            "scroll",
            function () {
                const currentY = window.scrollY;

                const goingDown =
                    currentY > previousY + 6;

                const goingUp =
                    currentY < previousY - 6;

                if (goingDown && currentY > 100) {
                    header.classList.add("nav-hidden");

                    document.body.classList.add(
                        "reader-header-hidden"
                    );
                } else if (goingUp || currentY < 40) {
                    header.classList.remove("nav-hidden");

                    document.body.classList.remove(
                        "reader-header-hidden"
                    );
                }

                previousY = currentY;
            },
            { passive: true }
        );

        toggle.addEventListener("click", function () {
            const focused = document.body.classList.toggle(
                "focus-reader"
            );

            toggle.textContent = focused
                ? "Exit Focus"
                : "Focus Reader";

            toggle.setAttribute(
                "aria-pressed",
                String(focused)
            );
        });
    }

    // ==========================================
    // READER INITIALIZATION
    // ==========================================

    function renderReader() {
        const params = new URLSearchParams(
            window.location.search
        );

        const rawEpisode = params.get("episode");

        const number = rawEpisode === null
            ? 1
            : Number(rawEpisode);

        const episodeIndex = episodes.findIndex(
            (episode) => episode.number === number
        );

        if (
            episodeIndex === -1 ||
            !isUnlocked(number)
        ) {
            window.location.replace(
                withProgress("../index.html#episodes")
            );

            return;
        }

        const episode = episodes[episodeIndex];

        document.title =
            `${episode.title} | Cell Quest`;

        $("readerTitle").textContent =
            episode.title;

        $("readerProgress").textContent =
            `Episode ${episode.number} / ${episodes.length}`;

        // Mark links that must carry progress in offline mode.
        document.querySelectorAll(
            '.reader-page a[href^="../index.html"]'
        ).forEach(function (link) {
            link.dataset.homeLink =
                link.getAttribute("href");
        });

        updateHomeLinks();

        renderEpisodeNavigation(episode);

        renderComic(episode);

        updateEpisodeControls(
            episode,
            episodeIndex
        );

        setupReaderControls();

        showStorageWarning();

        loadQuiz(
            episode,
            episodeIndex
        );
    }

    // ==========================================
    // START
    // ==========================================

    if (document.body.classList.contains("reader-page")) {
        renderReader();
    } else {
        setupResetControl();
        renderLanding();
    }

})();
