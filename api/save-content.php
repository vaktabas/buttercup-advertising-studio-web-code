<?php
/**
 * Buttercup Studio Visual CMS - Live Server Save Endpoint (PHP / Apache / Hostinger / LiteSpeed)
 * Saves customized texts, images, and project locks to data/site-customizations.json on the server.
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    if (!$rawInput) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Empty request body']);
        exit;
    }

    $data = json_decode($rawInput, true);
    if (!$data || !isset($data['customizations'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid JSON payload. Missing customizations field.']);
        exit;
    }

    $customizations = $data['customizations'];
    
    // Target data file path
    $dataFile = __DIR__ . '/../data/site-customizations.json';
    $dataDir = dirname($dataFile);

    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }

    $jsonString = json_encode($customizations, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

    if (file_put_contents($dataFile, $jsonString, LOCK_EX) !== false) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Customizations successfully saved to live server disk (site-customizations.json)!',
            'timestamp' => date('c'),
            'stats' => [
                'texts' => count($customizations['texts'] ?? []),
                'images' => count($customizations['images'] ?? []),
                'lockedProjects' => count($customizations['lockedProjects'] ?? [])
            ]
        ]);
        exit;
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to write site-customizations.json to server disk. Check file permissions.']);
        exit;
    }
}

// GET returns current live customizations
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $dataFile = __DIR__ . '/../data/site-customizations.json';
    if (file_exists($dataFile)) {
        echo file_get_contents($dataFile);
    } else {
        echo json_encode(['texts' => new stdClass(), 'images' => new stdClass(), 'lockedProjects' => new stdClass()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);

