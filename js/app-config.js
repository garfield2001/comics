(function () {
    "use strict";

    /*
     * Number of pages per episode.
     * Change the values to match your actual images.
     */
    const pageCounts = [
        5, // Episode 1
        5, // Episode 2
        5, // Episode 3
        5, // Episode 4
        5, // Episode 5
        5, // Episode 6
        5, // Episode 7
        5  // Episode 8
    ];

    const comic = {
        title: "Cell Quest",
        subtitle: "The Tiny Adventure",

        folder: "Cell Quest",

        titlePages: [
            "Title 1.png",
            "Title 2.png"
        ],

        episodes: pageCounts.map(function (count, index) {
            const number = index + 1;

            return {
                number: number,
                title: `Episode ${number}`,
                pageCount: count
            };
        })
    };

    function assetPath(path) {
        const isReader = window.location.pathname
            .toLowerCase()
            .endsWith("/comics/reader.html");

        const base = isReader
            ? "../comics"
            : "comics";

        const encoded = path
            .split("/")
            .map(encodeURIComponent)
            .join("/");

        return `${base}/${encoded}`;
    }

    window.comicApp = {
        comic: comic,

        titlePagePath: function (fileName) {
            return assetPath(
                `${comic.folder}/${fileName}`
            );
        },

        episodePagePath: function (episode, page) {
            return assetPath(
                `${comic.folder}/Episode ${episode.number}/Page ${page}.png`
            );
        }
    };
})();