<?php
/**
 * Buttercup Advertising Studio - Live Visitor & Lead Tracking Engine
 * Records visitor analytics, city/geolocation, device details, and captured leads
 * Saves directly to /data/leads.json, /data/leads.csv, and /data/visitors-log.json
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

$dataDir = __DIR__ . '/../data';
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$leadsJsonFile = $dataDir . '/leads.json';
$leadsCsvFile  = $dataDir . '/leads.csv';
$visitsJsonFile = $dataDir . '/visitors-log.json';
$visitsCsvFile  = $dataDir . '/visitors-log.csv';

// Helper: Get real visitor IP
function getVisitorIp() {
    $keys = [
        'HTTP_CF_CONNECTING_IP',
        'HTTP_CLIENT_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_FORWARDED',
        'HTTP_FORWARDED_FOR',
        'HTTP_FORWARDED',
        'REMOTE_ADDR'
    ];
    foreach ($keys as $key) {
        if (!empty($_SERVER[$key])) {
            $ips = explode(',', $_SERVER[$key]);
            $ip = trim($ips[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

// Helper: Parse device/browser
function parseDevice($ua) {
    if (empty($ua)) return 'Unknown';
    $isMobile = preg_match('/(android|iphone|ipad|ipod|mobile)/i', $ua);
    $browser = 'Browser';
    if (stripos($ua, 'Chrome') !== false) $browser = 'Chrome';
    elseif (stripos($ua, 'Safari') !== false) $browser = 'Safari';
    elseif (stripos($ua, 'Firefox') !== false) $browser = 'Firefox';
    elseif (stripos($ua, 'Edge') !== false) $browser = 'Edge';
    return ($isMobile ? 'Mobile (' : 'Desktop (') . $browser . ')';
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET REQUESTS: Retrieve data for Admin Dashboard
if ($method === 'GET') {
    if ($action === 'download_leads_csv') {
        if (file_exists($leadsCsvFile)) {
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="buttercup_leads_' . date('Y-m-d') . '.csv"');
            readfile($leadsCsvFile);
            exit;
        } else {
            http_response_code(404);
            echo "No leads recorded yet.";
            exit;
        }
    }

    // Default GET: Return JSON stats & leads for Dashboard
    $leads = [];
    if (file_exists($leadsJsonFile)) {
        $leads = json_decode(file_get_contents($leadsJsonFile), true) ?: [];
    }

    $visits = [];
    if (file_exists($visitsJsonFile)) {
        $visits = json_decode(file_get_contents($visitsJsonFile), true) ?: [];
    }

    echo json_encode([
        'success' => true,
        'stats' => [
            'total_leads' => count($leads),
            'total_visits_logged' => count($visits),
            'last_updated' => date('c')
        ],
        'leads' => array_reverse(array_slice($leads, -200)),
        'recent_visits' => array_reverse(array_slice($visits, -100))
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// POST REQUESTS: Track Visitor or Save Lead
if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $payload = json_decode($rawInput, true);

    if (!$payload && !empty($_POST)) {
        $payload = $_POST;
    }

    if (!$payload) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Empty request body']);
        exit;
    }

    $reqAction = $payload['action'] ?? $action ?? 'visit';
    $ip = getVisitorIp();
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $timestamp = date('Y-m-d H:i:s');
    $device = parseDevice($userAgent);

    // =========================================================================
    // CASE A: NEW INBOUND LEAD (Name, Phone/WhatsApp, Email, City)
    // =========================================================================
    if ($reqAction === 'lead') {
        $name = trim($payload['name'] ?? '');
        $phone = trim($payload['phone'] ?? $payload['whatsapp'] ?? '');
        $email = trim($payload['email'] ?? '');
        $city = trim($payload['city'] ?? $payload['location'] ?? 'Unknown');
        $notes = trim($payload['notes'] ?? $payload['message'] ?? 'Direct Lead Capture');
        $page = trim($payload['page'] ?? $_SERVER['HTTP_REFERER'] ?? '/');

        if (empty($name) && empty($phone) && empty($email)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Name or Phone number is required']);
            exit;
        }

        $leadRecord = [
            'id' => 'lead_' . time() . '_' . mt_rand(100, 999),
            'timestamp' => $timestamp,
            'name' => $name,
            'phone' => $phone,
            'email' => $email,
            'city' => $city,
            'notes' => $notes,
            'page' => $page,
            'ip' => $ip,
            'device' => $device
        ];

        // 1. Append to leads.json
        $existingLeads = [];
        if (file_exists($leadsJsonFile)) {
            $existingLeads = json_decode(file_get_contents($leadsJsonFile), true) ?: [];
        }
        $existingLeads[] = $leadRecord;
        file_put_contents($leadsJsonFile, json_encode($existingLeads, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);

        // 2. Append to leads.csv
        $isNewCsv = !file_exists($leadsCsvFile) || filesize($leadsCsvFile) === 0;
        $csvFp = fopen($leadsCsvFile, 'a');
        if ($csvFp) {
            if ($isNewCsv) {
                fputcsv($csvFp, ['Timestamp', 'Name', 'Phone/WhatsApp', 'Email', 'City/Location', 'Page', 'Notes', 'IP Address', 'Device']);
            }
            fputcsv($csvFp, [
                $timestamp,
                $name,
                $phone,
                $email,
                $city,
                $page,
                $notes,
                $ip,
                $device
            ]);
            fclose($csvFp);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Lead saved successfully to server disk (leads.json & leads.csv)!',
            'lead_id' => $leadRecord['id']
        ]);
        exit;
    }

    // =========================================================================
    // CASE B: AUTOMATIC VISITOR TELEMETRY (City, Page, Referrer, Device, IP)
    // =========================================================================
    if ($reqAction === 'visit') {
        $page = trim($payload['page'] ?? $_SERVER['HTTP_REFERER'] ?? '/');
        $referrer = trim($payload['referrer'] ?? 'Direct / None');
        $clientCity = trim($payload['city'] ?? '');
        $clientCountry = trim($payload['country'] ?? '');
        $screen = trim($payload['screen'] ?? '');

        $visitRecord = [
            'timestamp' => $timestamp,
            'ip' => $ip,
            'city' => $clientCity ?: 'Detecting...',
            'country' => $clientCountry ?: 'India',
            'page' => $page,
            'referrer' => $referrer,
            'screen' => $screen,
            'device' => $device
        ];

        // Append to visitors-log.json (keep max 1000 items)
        $existingVisits = [];
        if (file_exists($visitsJsonFile)) {
            $existingVisits = json_decode(file_get_contents($visitsJsonFile), true) ?: [];
        }
        $existingVisits[] = $visitRecord;
        if (count($existingVisits) > 1000) {
            $existingVisits = array_slice($existingVisits, -1000);
        }
        file_put_contents($visitsJsonFile, json_encode($existingVisits, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);

        // Append to visitors-log.csv
        $isNewVisitsCsv = !file_exists($visitsCsvFile) || filesize($visitsCsvFile) === 0;
        $visFp = fopen($visitsCsvFile, 'a');
        if ($visFp) {
            if ($isNewVisitsCsv) {
                fputcsv($visFp, ['Timestamp', 'IP Address', 'City', 'Country', 'Page Visited', 'Referrer', 'Device', 'Screen']);
            }
            fputcsv($visFp, [
                $timestamp,
                $ip,
                $clientCity ?: 'Unknown',
                $clientCountry ?: 'India',
                $page,
                $referrer,
                $device,
                $screen
            ]);
            fclose($visFp);
        }

        echo json_encode([
            'success' => true,
            'tracked' => true,
            'ip' => $ip,
            'timestamp' => $timestamp
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Unknown action']);
}
