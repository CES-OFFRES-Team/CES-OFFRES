<?php

require_once __DIR__ . '/../config/database.php';

class JWTUtils {
    private $secretKey;
    private $db;

    public function __construct() {
        $this->secretKey = 'votre_cle_secrete_jwt';  // À remplacer par une clé sécurisée
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function verifyToken($token) {
        try {
            if (empty($token)) {
                error_log("Token vide");
                return false;
            }

            // Diviser le token en ses composants (header, payload, signature)
            $tokenParts = explode('.', $token);
            if (count($tokenParts) != 3) {
                error_log("Format de token invalide");
                return false;
            }

            list($header, $payload, $signature) = $tokenParts;

            // Décoder le payload
            $decodedPayload = json_decode($this->base64UrlDecode($payload));
            if (!$decodedPayload) {
                error_log("Impossible de décoder le payload");
                return false;
            }

            // Vérifier si le token a expiré
            if (isset($decodedPayload->exp) && $decodedPayload->exp < time()) {
                error_log("Token expiré");
                return false;
            }

            // Vérifier la signature
            $expectedSignature = hash_hmac('sha256', $header . '.' . $payload, $this->secretKey, true);
            $expectedSignature = $this->base64UrlEncode($expectedSignature);

            if ($signature !== $expectedSignature) {
                error_log("Signature invalide");
                error_log("Attendu: " . $expectedSignature);
                error_log("Reçu: " . $signature);
                return false;
            }

            // Vérifier si l'utilisateur existe toujours en base de données
            $stmt = $this->db->prepare("SELECT id_personne FROM Personne WHERE id_personne = ?");
            $stmt->execute([$decodedPayload->id]);
            
            if (!$stmt->fetch()) {
                error_log("Utilisateur non trouvé en base de données");
                return false;
            }

            return $decodedPayload;

        } catch (Exception $e) {
            error_log("Erreur de vérification du token: " . $e->getMessage());
            return false;
        }
    }

    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64UrlDecode($data) {
        $pad = strlen($data) % 4;
        if ($pad) {
            $data .= str_repeat('=', 4 - $pad);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public function generateToken($userId, $role) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        
        $payload = json_encode([
            'id' => $userId,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24) // Expire dans 24 heures
        ]);

        $base64UrlHeader = $this->base64UrlEncode($header);
        $base64UrlPayload = $this->base64UrlEncode($payload);

        $signature = hash_hmac('sha256', 
            $base64UrlHeader . '.' . $base64UrlPayload, 
            $this->secretKey, 
            true
        );

        $base64UrlSignature = $this->base64UrlEncode($signature);

        return "$base64UrlHeader.$base64UrlPayload.$base64UrlSignature";
    }
} 