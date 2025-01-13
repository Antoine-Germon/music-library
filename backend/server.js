const express = require("express");
const YTDlpWrap = require("yt-dlp-wrap").default;
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();

// Activer cors pour toutes les origines
app.use(cors());

app.use(express.json());

const upload = multer({ dest: 'uploads/' });

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
            audioPath: `/media/${sanitizedTitle}/${sanitizedTitle}.mp3`,
            thumbnailPath: `/media/${sanitizedTitle}/${sanitizedTitle}.jpg`,
            title: videoTitle,
        });

        // write title to file
        fs.writeFileSync(path.join(songFolder, "title.txt"), videoTitle);
    } catch (error) {
        console.error("Erreur lors du téléchargement :", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Servir les fichiers téléchargés
app.use("/media", express.static(path.resolve(__dirname, "../assets/media")));

app.post("/api/upload", upload.single('croppedImage'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    // Move the file to the desired location
    let targetPath = path.join(MEDIA_DIR, req.file.originalname);

    console.log("targetPath", targetPath);

    targetPath = targetPath.slice(0, targetPath.lastIndexOf(".")) + "/" + req.file.originalname.slice(0, req.file.originalname.lastIndexOf(".")) + ".jpg";

    fs.rename(req.file.path, targetPath, (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to save file.", from: req.file.path, to: targetPath, media_dir: MEDIA_DIR, req_file: req.file.originalname });
        }

        res.json({ success: true, filePath: `/media/${req.file.originalname}` });
    });
});

app.get("/api/songs", (req, res) => {
    const songs = fs.readdirSync(MEDIA_DIR, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => {
            const titlePath = path.join(MEDIA_DIR, dirent.name, "title.txt");
            const title = fs.existsSync(titlePath) ? fs.readFileSync(titlePath, "utf-8") : dirent.name;

            return {
                title,
                audioPath: `/media/${dirent.name}/${dirent.name}.mp3`,
                thumbnailPath: `/media/${dirent.name}/${dirent.name}.jpg`,
            };
        });

    res.json(songs);
});

// Démarrer le serveur
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
