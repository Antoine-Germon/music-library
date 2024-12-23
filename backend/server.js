const express = require("express");
const YTDlpWrap = require("yt-dlp-wrap").default;
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// Activer cors pour toutes les origines
app.use(cors());

app.use(express.json());

YTDlpWrap.downloadFromGithub("downloads/yt-dlp-binaries", "2024.12.13")
    .then(() => {
        console.log("yt-dlp downloaded successfully");
        ytDlpWrap.setBinaryPath("downloads/yt-dlp-binaries");
    })
    .catch((error) => console.error("Error downloading yt-dlp:", error));

// Chemin principal pour les fichiers médias
const MEDIA_DIR = path.resolve(__dirname, "../assets/media");

// Assure-toi que le répertoire existe
if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// Initialisation de yt-dlp-wrap
const ytDlpWrap = new YTDlpWrap();

app.post("/api/download", async (req, res) => {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
        return res.status(400).json({ error: "Un lien YouTube est requis." });
    }

    try {
        // Récupère les métadonnées pour obtenir le titre de la vidéo
        const metadata = await ytDlpWrap.getVideoInfo([youtubeUrl]);
        const videoTitle = metadata.title.replace(/[<>:"/\\|?*]+/g, ""); // Nettoyage des caractères invalides

        // Chemins pour les fichiers de cette chanson
        const sanitizedTitle = videoTitle.replace(/[<>:"/\\|?* ]+/g, "-"); // Remplace les espaces et caractères spéciaux
        const songFolder = path.join(MEDIA_DIR, sanitizedTitle);
        const audioPath = path.join(songFolder, `${sanitizedTitle}.mp3`);
        const iconPath = path.join(songFolder, `${sanitizedTitle}`);

        // Crée le dossier pour cette chanson
        if (!fs.existsSync(songFolder)) {
            fs.mkdirSync(songFolder, { recursive: true });
        }

        // Télécharge l'audio
        await ytDlpWrap.execPromise([
            youtubeUrl,
            "-x", // Extraction de l'audio
            "--audio-format",
            "mp3",
            "-o",
            audioPath, // Chemin de sortie
        ]);

        // Télécharge la miniature et la convertit en JPG
        await ytDlpWrap.execPromise([
            youtubeUrl,
            "--write-thumbnail",
            "--convert-thumbnails",
            "jpg",
            "--skip-download",
            "-o",
            `${iconPath}.%(ext)s`, // Chemin de sortie
        ]);

        // Répond avec les informations du téléchargement
        res.json({
            success: true,
            audioPath: `/media/${videoTitle}/${videoTitle}.mp3`,
            thumbnailPath: `/media/${videoTitle}/${videoTitle}.jpg`,
            title: videoTitle,
        });
    } catch (error) {
        console.error("Erreur lors du téléchargement :", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Servir les fichiers téléchargés
app.use("/media", express.static(path.resolve(__dirname, "../assets/media")));

app.get("/api/songs", (req, res) => {
    try {
        const songs = fs.readdirSync(MEDIA_DIR).map((songFolder) => {
            const songPath = path.join(MEDIA_DIR, songFolder);
            const files = fs.readdirSync(songPath);

            const mp3File = files.find((file) => file.endsWith(".mp3"));
            const thumbnailFile = files.find((file) => file.endsWith(".jpg"));

            if (mp3File && thumbnailFile) {
                return {
                    title: songFolder,
                    audio: `/media/${songFolder}/${mp3File}`,
                    thumbnail: `/media/${songFolder}/${thumbnailFile}`,
                };
            }

            return null;
        });

        res.json(songs.filter(Boolean)); // Filter out invalid entries
    } catch (error) {
        console.error("Error listing songs:", error);
        res.status(500).json({ error: "Failed to fetch songs." });
    }
});

// Démarrer le serveur
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
