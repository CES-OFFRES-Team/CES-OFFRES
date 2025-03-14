<?php

class Candidature {
    private $conn;
    private $table = 'candidatures';

    // Propriétés
    public $id;
    public $offre_id;
    public $nom;
    public $prenom;
    public $email;
    public $telephone;
    public $cv_path;
    public $lettre_motivation;
    public $date_postulation;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Créer une nouvelle candidature
    public function create() {
        $query = "INSERT INTO " . $this->table . "
                SET
                    offre_id = :offre_id,
                    nom = :nom,
                    prenom = :prenom,
                    email = :email,
                    telephone = :telephone,
                    cv_path = :cv_path,
                    lettre_motivation = :lettre_motivation";

        $stmt = $this->conn->prepare($query);

        // Nettoyer les données
        $this->offre_id = htmlspecialchars(strip_tags($this->offre_id));
        $this->nom = htmlspecialchars(strip_tags($this->nom));
        $this->prenom = htmlspecialchars(strip_tags($this->prenom));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->telephone = htmlspecialchars(strip_tags($this->telephone));
        $this->cv_path = htmlspecialchars(strip_tags($this->cv_path));
        $this->lettre_motivation = htmlspecialchars(strip_tags($this->lettre_motivation));

        // Lier les paramètres
        $stmt->bindParam(":offre_id", $this->offre_id);
        $stmt->bindParam(":nom", $this->nom);
        $stmt->bindParam(":prenom", $this->prenom);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":telephone", $this->telephone);
        $stmt->bindParam(":cv_path", $this->cv_path);
        $stmt->bindParam(":lettre_motivation", $this->lettre_motivation);

        return $stmt->execute();
    }

    // Récupérer toutes les candidatures pour une offre
    public function getCandidaturesByOffre($offre_id) {
        $query = "SELECT * FROM " . $this->table . " WHERE offre_id = :offre_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":offre_id", $offre_id);
        $stmt->execute();
        return $stmt;
    }
} 