<?php
header('Content-Type: application/json');

echo json_encode([
    'user' => posix_getpwuid(posix_geteuid())['name'],
    'group' => posix_getgrgid(posix_getegid())['name'],
    'upload_dir' => __DIR__ . '/uploads',
    'upload_dir_exists' => file_exists(__DIR__ . '/uploads'),
    'upload_dir_permissions' => substr(sprintf('%o', fileperms(__DIR__ . '/uploads')), -4)
]); 