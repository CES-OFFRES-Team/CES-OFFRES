<?php
header('Content-Type: application/json');

$upload_dir = __DIR__ . '/uploads';
$test_file = $upload_dir . '/test_write.txt';

try {
    // Vérifier si le dossier existe
    if (!file_exists($upload_dir)) {
        throw new Exception("Le dossier uploads n'existe pas");
    }

    // Vérifier les permissions du dossier
    $perms = fileperms($upload_dir);
    $perms_octal = substr(sprintf('%o', $perms), -4);
    
    // Tenter d'écrire un fichier test
    $test_content = "Test d'écriture - " . date('Y-m-d H:i:s');
    if (file_put_contents($test_file, $test_content) === false) {
        throw new Exception("Impossible d'écrire dans le dossier");
    }

    // Vérifier si le fichier a été créé
    if (!file_exists($test_file)) {
        throw new Exception("Le fichier test n'a pas été créé");
    }

    // Nettoyer le fichier test
    unlink($test_file);

    echo json_encode([
        'status' => 'success',
        'message' => 'Le dossier est accessible en écriture',
        'details' => [
            'chemin' => $upload_dir,
            'permissions' => $perms_octal,
            'proprietaire' => posix_getpwuid(fileowner($upload_dir))['name'],
            'groupe' => posix_getgrgid(filegroup($upload_dir))['name']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'details' => [
            'chemin' => $upload_dir,
            'permissions' => isset($perms_octal) ? $perms_octal : 'non disponible'
        ]
    ]);
} 