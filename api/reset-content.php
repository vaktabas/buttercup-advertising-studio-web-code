<?php
/**
 * Buttercup Studio Visual CMS - Live Server Reset Endpoint (PHP / Apache / Hostinger)
 * Resets site-customizations.json to empty defaults.
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/../data/site-customizations.json';
$empty = [
    'texts' => new stdClass(),
    'images' => new stdClass(),
    'lockedProjects' => new stdClass()
];

file_put_contents($dataFile, json_encode($empty, JSON_PRETTY_PRINT));
echo json_encode([
    'success' => true,
    'message' => 'All customizations have been reset to clean default code.'
]);
